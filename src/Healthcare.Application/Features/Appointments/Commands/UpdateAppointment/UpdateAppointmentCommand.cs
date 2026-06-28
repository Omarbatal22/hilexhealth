using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Appointments.Commands.UpdateAppointment;

public record UpdateAppointmentCommand : IRequest
{
    public Guid Id { get; init; }
    public DateTime AppointmentDate { get; init; }
    public int DurationMinutes { get; init; }
    public string Reason { get; init; } = null!;
}

public class UpdateAppointmentCommandValidator : AbstractValidator<UpdateAppointmentCommand>
{
    public UpdateAppointmentCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AppointmentDate).GreaterThan(DateTime.UtcNow).WithMessage("Appointment date must be in the future.");
        RuleFor(x => x.DurationMinutes).GreaterThan(0).LessThanOrEqualTo(180);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class UpdateAppointmentCommandHandler : IRequestHandler<UpdateAppointmentCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public UpdateAppointmentCommandHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task Handle(UpdateAppointmentCommand request, CancellationToken cancellationToken)
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
                new ValidationError("Status", "Cannot update a cancelled appointment.") 
            });
        }

        // Check double booking for Doctor, excluding this appointment
        var requestedStart = request.AppointmentDate;
        var requestedEnd = requestedStart.AddMinutes(request.DurationMinutes);

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

        // Check double booking for Patient, excluding this appointment
        var patientOverlap = await _context.Appointments
            .AnyAsync(a => a.PatientId == appointment.PatientId && 
                           a.Id != request.Id &&
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

        // Update properties
        appointment.AppointmentDate = request.AppointmentDate;
        appointment.DurationMinutes = request.DurationMinutes;
        appointment.Reason = request.Reason;

        await _context.SaveChangesAsync(cancellationToken);

        // Raise appointment booked event as the scheduling detail changed
        await _mediator.Publish(new AppointmentBookedEvent(appointment), cancellationToken);
    }
}
