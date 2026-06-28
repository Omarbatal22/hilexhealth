using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Messages.Queries.GetConversation;

public record GetConversationQuery(Guid AppointmentId) : IRequest<IReadOnlyList<MessageDto>>;

public class GetConversationQueryHandler : IRequestHandler<GetConversationQuery, IReadOnlyList<MessageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public GetConversationQueryHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<IReadOnlyList<MessageDto>> Handle(GetConversationQuery request, CancellationToken cancellationToken)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender).ThenInclude(u => u.Patient)
            .Include(m => m.Sender).ThenInclude(u => u.Doctor)
            .Include(m => m.Recipient).ThenInclude(u => u.Patient)
            .Include(m => m.Recipient).ThenInclude(u => u.Doctor)
            .Where(m => m.AppointmentId == request.AppointmentId)
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);

        var dtos = messages.Select(m =>
        {
            var senderName = m.Sender.Role == "Patient"
                ? $"{m.Sender.Patient?.FirstName} {m.Sender.Patient?.LastName}"
                : m.Sender.Role == "Doctor"
                    ? $"Dr. {m.Sender.Doctor?.FirstName} {m.Sender.Doctor?.LastName}"
                    : "Administrator";

            var recipientName = m.Recipient.Role == "Patient"
                ? $"{m.Recipient.Patient?.FirstName} {m.Recipient.Patient?.LastName}"
                : m.Recipient.Role == "Doctor"
                    ? $"Dr. {m.Recipient.Doctor?.FirstName} {m.Recipient.Doctor?.LastName}"
                    : "Administrator";

            return new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = senderName,
                RecipientId = m.RecipientId,
                RecipientName = recipientName,
                AppointmentId = m.AppointmentId,
                Content = _encryptionService.Decrypt(m.EncryptedContent),
                SentAt = m.SentAt,
                IsRead = m.IsRead,
                ReadAt = m.ReadAt
            };
        }).ToList();

        return dtos;
    }
}
