using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Appointments.Commands.RescheduleAppointment;

public record RescheduleAppointmentCommand : IRequest
{
    public Guid Id { get; init; }
    public DateTime AppointmentDate { get; init; }
}

public class RescheduleAppointmentCommandValidator : AbstractValidator<RescheduleAppointmentCommand>
{
    public RescheduleAppointmentCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AppointmentDate).GreaterThan(DateTime.UtcNow).WithMessage("Rescheduled date must be in the future.");
    }
}

public class RescheduleAppointmentCommandHandler : IRequestHandler<RescheduleAppointmentCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public RescheduleAppointmentCommandHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task Handle(RescheduleAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (appointment == null)
        {
            throw new Healthcare.Application.Common.Exceptions.NotFoundException(nameof(Appointment), request.Id);
        }

        if (appointment.Status == "Cancelled")
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("Status", "Cannot reschedule a cancelled appointment.") 
            });
        }

        // Check double booking for Doctor, excluding this appointment
        var requestedStart = request.AppointmentDate;
        var requestedEnd = requestedStart.AddMinutes(appointment.DurationMinutes);

        var doctorOverlap = await _context.Appointments
            .AnyAsync(a => a.DoctorId == appointment.DoctorId && 
                           a.Id != request.Id &&
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

        appointment.AppointmentDate = request.AppointmentDate;

        await _context.SaveChangesAsync(cancellationToken);

        // Raise appointment booked event as the scheduling detail changed
        await _mediator.Publish(new AppointmentBookedEvent(appointment), cancellationToken);
    }
}
