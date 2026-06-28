using System;

namespace Healthcare.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Type { get; set; } = null!; // e.g. AppointmentConfirmation
    public string Content { get; set; } = null!;
    public string Channel { get; set; } = null!; // Email, SMS, Push
    public string Status { get; set; } = "Pending"; // Pending, Sent, Failed
    public DateTime? SentAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int RetryCount { get; set; } = 0;
    public string? Error { get; set; }
}
