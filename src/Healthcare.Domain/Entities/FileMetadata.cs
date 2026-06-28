using System;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class FileMetadata : AuditableEntity, ISoftDelete
{
    public Guid UploaderId { get; set; }
    public User Uploader { get; set; } = null!;

    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public string FileName { get; set; } = null!;
    public string StoragePath { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public long FileSizeInBytes { get; set; }
    public string AccessLevel { get; set; } = "Private"; // Private, SharedWithDoctor, Public

    // Soft delete implementation
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
