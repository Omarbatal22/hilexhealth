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

namespace Healthcare.Application.Features.Messages.Commands.SendMessage;

public record SendMessageCommand : IRequest<Guid>
{
    public Guid SenderId { get; init; }
    public Guid RecipientId { get; init; }
    public Guid AppointmentId { get; init; }
    public string Content { get; init; } = null!;
}

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.SenderId).NotEmpty();
        RuleFor(x => x.RecipientId).NotEmpty();
        RuleFor(x => x.AppointmentId).NotEmpty();
        RuleFor(x => x.Content).NotEmpty().MaximumLength(2000);
    }
}

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly IEncryptionService _encryptionService;

    public SendMessageCommandHandler(IApplicationDbContext context, IMediator mediator, IEncryptionService encryptionService)
    {
        _context = context;
        _mediator = mediator;
        _encryptionService = encryptionService;
    }

    public async Task<Guid> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify users exist
        var senderExists = await _context.Users.AnyAsync(u => u.Id == request.SenderId, cancellationToken);
        if (!senderExists)
        {
            throw new NotFoundException(nameof(User), request.SenderId);
        }

        var recipientExists = await _context.Users.AnyAsync(u => u.Id == request.RecipientId, cancellationToken);
        if (!recipientExists)
        {
            throw new NotFoundException(nameof(User), request.RecipientId);
        }

        // 2. Verify appointment exists and belongs to these users
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

        if (appointment == null)
        {
            throw new NotFoundException(nameof(Appointment), request.AppointmentId);
        }

        // Verify sender and recipient are patient & doctor (or vice versa) for the appointment
        var isSenderPatient = appointment.Patient.UserId == request.SenderId;
        var isSenderDoctor = appointment.Doctor.UserId == request.SenderId;
        var isRecipientPatient = appointment.Patient.UserId == request.RecipientId;
        var isRecipientDoctor = appointment.Doctor.UserId == request.RecipientId;

        if (!((isSenderPatient && isRecipientDoctor) || (isSenderDoctor && isRecipientPatient)))
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("AppointmentId", "Users must be participants in this appointment to send messages.") 
            });
        }

        // 3. Encrypt message and save
        var encryptedContent = _encryptionService.Encrypt(request.Content);

        var message = new Message
        {
            SenderId = request.SenderId,
            RecipientId = request.RecipientId,
            AppointmentId = request.AppointmentId,
            EncryptedContent = encryptedContent,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Publish Event (preparing for SignalR hub dispatcher)
        await _mediator.Publish(new MessageSentEvent(message), cancellationToken);

        return message.Id;
    }
}
