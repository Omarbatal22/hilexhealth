using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Triage.EventHandlers;

public class TriageAssessmentCreatedEventHandler : INotificationHandler<TriageAssessmentCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TriageAssessmentCreatedEventHandler> _logger;

    public TriageAssessmentCreatedEventHandler(
        IApplicationDbContext context,
        ILogger<TriageAssessmentCreatedEventHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Handle(TriageAssessmentCreatedEvent notification, CancellationToken cancellationToken)
    {
        var assessment = notification.Assessment;
        _logger.LogInformation("Processing triage escalation for assessment {AssessmentId}, Urgency: {Urgency}", 
            assessment.Id, assessment.UrgencyLevel);

        // Fetch patient and user info
        var patient = await _context.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == assessment.PatientId, cancellationToken);

        if (patient == null)
        {
            _logger.LogError("Patient with ID {PatientId} not found during triage escalation.", assessment.PatientId);
            return;
        }

        // 1. Notify the patient immediately
        var patientContent = $"URGENT TRIAGE ALERT: Our AI Triage Engine has assessed your symptoms as {assessment.UrgencyLevel.ToString().ToUpper()}. " +
                             $"Recommendation: {assessment.Recommendation} Please seek immediate medical attention.";

        var patientNotification = new Notification
        {
            UserId = patient.UserId,
            Type = "TriageUrgentAlert",
            Content = patientContent,
            Channel = "Push", // Real-time push + SMS fallback
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(patientNotification);

        // 2. Identify doctor to escalate to
        // Try to find the patient's primary/recent doctor, or fallback to the first active doctor in the system
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => !d.IsDeleted, cancellationToken); // Or match specialty

        if (doctor != null)
        {
            assessment.EscalatedToDoctorId = doctor.Id;
            assessment.EscalatedAt = DateTime.UtcNow;

            var doctorContent = $"CRITICAL CLINICAL ESCALATION: Patient {patient.FirstName} {patient.LastName} has logged high/critical urgency symptoms: " +
                                $"\"{assessment.SymptomDescription}\". Urgency Level: {assessment.UrgencyLevel}. Please review immediately.";

            var doctorNotification = new Notification
            {
                UserId = doctor.UserId,
                Type = "TriageEscalationAlert",
                Content = doctorContent,
                Channel = "Email",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(doctorNotification);
            
            _logger.LogWarning("Triage assessment {AssessmentId} escalated to Doctor {DoctorId}.", assessment.Id, doctor.Id);
        }
        else
        {
            // If no doctor is available, escalate to the System Admin
            _logger.LogWarning("No doctor found. Escalating triage assessment {AssessmentId} to System Administrator.", assessment.Id);
            
            // Try to find an administrator
            var adminUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == "admin@healthcare.com" || u.NormalizedEmail == "ADMIN@HEALTHCARE.COM", cancellationToken);

            if (adminUser != null)
            {
                var adminNotification = new Notification
                {
                    UserId = adminUser.Id,
                    Type = "TriageSystemEscalation",
                    Content = $"UNRESOLVED CLINICAL ESCALATION: Patient {patient.FirstName} {patient.LastName} has critical triage status, but no doctors are available. Action required.",
                    Channel = "SMS",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(adminNotification);
            }
        }

        // Save notification records
        await _context.SaveChangesAsync(cancellationToken);
    }
}
