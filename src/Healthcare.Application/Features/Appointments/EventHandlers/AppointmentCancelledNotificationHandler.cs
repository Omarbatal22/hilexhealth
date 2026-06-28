using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Notifications.Commands.SendNotification;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Appointments.EventHandlers;

public class AppointmentCancelledNotificationHandler : INotificationHandler<AppointmentCancelledEvent>
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public AppointmentCancelledNotificationHandler(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    public async Task Handle(AppointmentCancelledEvent notification, CancellationToken cancellationToken)
    {
        var appointment = await _context.Appointments
            .IgnoreQueryFilters() // In case it was soft deleted
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == notification.Appointment.Id, cancellationToken);

        if (appointment == null) return;

        var msg = $"The appointment scheduled for {appointment.AppointmentDate:f} has been cancelled. Reason: {appointment.CancellationReason}.";

        // Notify Patient via Email
        await _mediator.Send(new SendNotificationCommand
        {
            UserId = appointment.Patient.UserId,
            Type = "AppointmentCancelled",
            Content = msg,
            Channel = "Email"
        }, cancellationToken);

        // Notify Doctor via Push
        await _mediator.Send(new SendNotificationCommand
        {
            UserId = appointment.Doctor.UserId,
            Type = "AppointmentCancelled",
            Content = msg,
            Channel = "Push"
        }, cancellationToken);
    }
}
