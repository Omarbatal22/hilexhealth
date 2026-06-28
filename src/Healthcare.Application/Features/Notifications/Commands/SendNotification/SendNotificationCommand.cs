using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Notifications.Commands.SendNotification;

public record SendNotificationCommand : IRequest<Guid>
{
    public Guid UserId { get; init; }
    public string Type { get; init; } = null!;
    public string Content { get; init; } = null!;
    public string Channel { get; init; } = null!; // Email, SMS, Push
}

public class SendNotificationCommandHandler : IRequestHandler<SendNotificationCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public SendNotificationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new Healthcare.Application.Common.Exceptions.NotFoundException(nameof(User), request.UserId);
        }

        var notification = new Notification
        {
            UserId = request.UserId,
            Type = request.Type,
            Content = request.Content,
            Channel = request.Channel,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        return notification.Id;
    }
}
