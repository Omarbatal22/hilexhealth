using System;
using Healthcare.Domain.Common;
using Healthcare.Domain.Enums;

namespace Healthcare.Domain.Entities;

public class TriagePrediction : BaseEntity
{
    public Guid TriageAssessmentId { get; set; }
    public TriageAssessment TriageAssessment { get; set; } = null!;

    public Guid ModelVersionId { get; set; }
    public ModelVersion ModelVersion { get; set; } = null!;

    public UrgencyLevel UrgencyLevel { get; set; }
    public double Confidence { get; set; }
    public PredictionSource PredictionSource { get; set; } = PredictionSource.Primary;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
