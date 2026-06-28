using System;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class TrainingDataset : AuditableEntity, ISoftDelete
{
    public string Version { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int RowCount { get; set; }
    public string FeaturesList { get; set; } = null!; // Comma-separated names
    public string StoragePath { get; set; } = null!;
    public bool IsActive { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
