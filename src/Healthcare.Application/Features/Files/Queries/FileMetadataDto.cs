using System;

namespace Healthcare.Application.Features.Files.Queries;

public record FileMetadataDto
{
    public Guid Id { get; init; }
    public Guid UploaderId { get; init; }
    public Guid? AppointmentId { get; init; }
    public string FileName { get; init; } = null!;
    public string StoragePath { get; init; } = null!;
    public string ContentType { get; init; } = null!;
    public long FileSizeInBytes { get; init; }
    public string AccessLevel { get; init; } = null!;
    public DateTime CreatedAt { get; init; }
}
