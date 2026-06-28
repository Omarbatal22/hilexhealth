using System;
using System.Collections.Generic;
using Healthcare.Domain.Common;
using Healthcare.Domain.Enums;

namespace Healthcare.Domain.Entities;

public class ModelVersion : AuditableEntity, ISoftDelete
{
    public string Name { get; set; } = null!;
    public string Algorithm { get; set; } = null!;
    public string Version { get; set; } = null!;
    public ModelStatus Status { get; set; } = ModelStatus.Draft;
    public string ArtifactPath { get; set; } = null!; // ONNX model location
    
    public Guid? TrainingDatasetId { get; set; }
    public TrainingDataset? TrainingDataset { get; set; }
    
    public bool IsActive { get; set; }

    public ICollection<ModelPerformanceMetric> PerformanceMetrics { get; set; } = new List<ModelPerformanceMetric>();

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
