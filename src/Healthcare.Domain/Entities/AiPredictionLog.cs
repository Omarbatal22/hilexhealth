using System;
using Healthcare.Domain.Common;
using Healthcare.Domain.Enums;

namespace Healthcare.Domain.Entities;

public class AiPredictionLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string CorrelationId { get; set; } = null!;
    public string ModelVersionName { get; set; } = null!;
    public string FeaturesJson { get; set; } = null!; // Input feature vector
    public string OutputProbabilitiesJson { get; set; } = null!; // Prediction probability per class
    public UrgencyLevel UrgencyLevel { get; set; }
    public double Confidence { get; set; }
    public long ExecutionTimeMs { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
