using System;
using System.Collections.Generic;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class Appointment : AuditableEntity, ISoftDelete
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }
    public int DurationMinutes { get; set; }
    public string Reason { get; set; } = null!;
    public string Status { get; set; } = "Booked"; // Booked, Confirmed, Cancelled, Completed, NoShow
    public string? CancellationReason { get; set; }

    // Navigation properties
    public ICollection<FileMetadata> Attachments { get; set; } = new List<FileMetadata>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();

    // Soft delete implementation
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
