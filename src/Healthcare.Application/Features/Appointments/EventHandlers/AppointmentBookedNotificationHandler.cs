using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Notifications.Commands.SendNotification;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Appointments.EventHandlers;

public class AppointmentBookedNotificationHandler : INotificationHandler<AppointmentBookedEvent>
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public AppointmentBookedNotificationHandler(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    public async Task Handle(AppointmentBookedEvent notification, CancellationToken cancellationToken)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == notification.Appointment.Id, cancellationToken);

        if (appointment == null) return;

        // Send Email notification to Patient
        var patientMsg = $"Dear {appointment.Patient.FirstName}, your appointment with Dr. {appointment.Doctor.LastName} has been booked for {appointment.AppointmentDate:f}.";
        await _mediator.Send(new SendNotificationCommand
        {
            UserId = appointment.Patient.UserId,
            Type = "AppointmentBooked",
            Content = patientMsg,
            Channel = "Email"
        }, cancellationToken);

        // Send Push notification to Doctor
        var doctorMsg = $"Dr. {appointment.Doctor.LastName}, you have a new appointment with Patient {appointment.Patient.FirstName} {appointment.Patient.LastName} booked for {appointment.AppointmentDate:f}.";
        await _mediator.Send(new SendNotificationCommand
        {
            UserId = appointment.Doctor.UserId,
            Type = "AppointmentBooked",
            Content = doctorMsg,
            Channel = "Push"
        }, cancellationToken);
    }
}
