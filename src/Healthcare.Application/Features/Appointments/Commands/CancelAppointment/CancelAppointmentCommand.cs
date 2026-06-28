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

namespace Healthcare.Application.Features.Appointments.Commands.CancelAppointment;

public record CancelAppointmentCommand : IRequest
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = null!;
}

public class CancelAppointmentCommandValidator : AbstractValidator<CancelAppointmentCommand>
{
    public CancelAppointmentCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class CancelAppointmentCommandHandler : IRequestHandler<CancelAppointmentCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public CancelAppointmentCommandHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task Handle(CancelAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (appointment == null)
        {
            throw new Healthcare.Application.Common.Exceptions.NotFoundException(nameof(Appointment), request.Id);
        }

        if (appointment.Status == "Cancelled")
        {
            return; // Already cancelled
        }

        appointment.Status = "Cancelled";
        appointment.CancellationReason = request.Reason;

        appointment.AddDomainEvent(new AppointmentCancelledEvent(appointment));

        await _context.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(new AppointmentCancelledEvent(appointment), cancellationToken);
    }
}
