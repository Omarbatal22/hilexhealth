using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Appointments.Commands.CreateAppointment;

public record CreateAppointmentCommand : IRequest<Guid>
{
    public Guid PatientId { get; init; }
    public Guid DoctorId { get; init; }
    public DateTime AppointmentDate { get; init; }
    public int DurationMinutes { get; init; }
    public string Reason { get; init; } = null!;
}

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.DoctorId).NotEmpty();
        RuleFor(x => x.AppointmentDate).GreaterThan(DateTime.UtcNow).WithMessage("Appointment date must be in the future.");
        RuleFor(x => x.DurationMinutes).GreaterThan(0).LessThanOrEqualTo(180);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public CreateAppointmentCommandHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<Guid> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify patient exists
        var patientExists = await _context.Patients.AnyAsync(p => p.Id == request.PatientId, cancellationToken);
        if (!patientExists)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] { new ValidationError("PatientId", "Patient not found.") });
        }

        // 1.5. Acquire a pessimistic write lock on the doctor's record to serialize booking and prevent double booking (relational only)
        Doctor? doctor = null;
        if (_context is DbContext efContext && efContext.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
        {
            doctor = await _context.Doctors
                .FromSqlInterpolated($"SELECT * FROM doctors WHERE \"Id\" = {request.DoctorId} FOR UPDATE")
                .SingleOrDefaultAsync(cancellationToken);
        }
        else
        {
            doctor = await _context.Doctors
                .SingleOrDefaultAsync(d => d.Id == request.DoctorId, cancellationToken);
        }

        if (doctor == null)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] { new ValidationError("DoctorId", "Doctor not found.") });
        }

        // 2. Prevent double booking
        var requestedStart = request.AppointmentDate;
        var requestedEnd = requestedStart.AddMinutes(request.DurationMinutes);

        // Check doctor availability
        var doctorOverlap = await _context.Appointments
            .AnyAsync(a => a.DoctorId == request.DoctorId && 
                           a.Status != "Cancelled" && 
                           requestedStart < a.AppointmentDate.AddMinutes(a.DurationMinutes) && 
                           a.AppointmentDate < requestedEnd, 
                           cancellationToken);

        if (doctorOverlap)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("AppointmentDate", "Doctor is already booked for the requested time slot.") 
            });
        }

        // Check patient availability
        var patientOverlap = await _context.Appointments
            .AnyAsync(a => a.PatientId == request.PatientId && 
                           a.Status != "Cancelled" && 
                           requestedStart < a.AppointmentDate.AddMinutes(a.DurationMinutes) && 
                           a.AppointmentDate < requestedEnd, 
                           cancellationToken);

        if (patientOverlap)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("AppointmentDate", "Patient already has another appointment scheduled during this time slot.") 
            });
        }

        // 3. Create appointment
        var appointment = new Appointment
        {
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            AppointmentDate = request.AppointmentDate,
            DurationMinutes = request.DurationMinutes,
            Reason = request.Reason,
            Status = "Booked"
        };

        _context.Appointments.Add(appointment);
        
        // Dispatch Domain Event
        appointment.AddDomainEvent(new AppointmentBookedEvent(appointment));

        await _context.SaveChangesAsync(cancellationToken);

        // Publish notification event via mediator
        await _mediator.Publish(new AppointmentBookedEvent(appointment), cancellationToken);

        return appointment.Id;
    }
}
