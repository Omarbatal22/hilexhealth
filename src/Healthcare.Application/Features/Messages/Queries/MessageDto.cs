using System;

namespace Healthcare.Application.Features.Messages.Queries;

public record MessageDto
{
    public Guid Id { get; init; }
    public Guid SenderId { get; init; }
    public string SenderName { get; init; } = null!;
    public Guid RecipientId { get; init; }
    public string RecipientName { get; init; } = null!;
    public Guid AppointmentId { get; init; }
    public string Content { get; init; } = null!;
    public DateTime SentAt { get; init; }
    public bool IsRead { get; init; }
    public DateTime? ReadAt { get; init; }
}
