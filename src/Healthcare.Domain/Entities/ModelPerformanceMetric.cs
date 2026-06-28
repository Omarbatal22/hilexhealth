using System;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class ModelPerformanceMetric : AuditableEntity
{
    public Guid ModelVersionId { get; set; }
    public ModelVersion ModelVersion { get; set; } = null!;
    public string MetricName { get; set; } = null!; // Accuracy, Recall, Precision, F1, ROC-AUC, CriticalRecall
    public double Value { get; set; }
}
