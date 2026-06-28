using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Appointments.Commands.UpdateAppointmentStatus;

public record UpdateAppointmentStatusCommand : IRequest
{
    public Guid Id { get; init; }
    public string Status { get; init; } = null!;
}

public class UpdateAppointmentStatusCommandValidator : AbstractValidator<UpdateAppointmentStatusCommand>
{
    public UpdateAppointmentStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().Must(status => 
            status == "Booked" || status == "Confirmed" || status == "Cancelled" || status == "Completed" || status == "NoShow")
            .WithMessage("Invalid status value.");
    }
}

public class UpdateAppointmentStatusCommandHandler : IRequestHandler<UpdateAppointmentStatusCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateAppointmentStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateAppointmentStatusCommand request, CancellationToken cancellationToken)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (appointment == null)
        {
            throw new Healthcare.Application.Common.Exceptions.NotFoundException(nameof(Appointment), request.Id);
        }

        appointment.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
