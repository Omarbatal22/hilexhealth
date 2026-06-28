using System;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class Symptom : AuditableEntity, ISoftDelete
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public string Description { get; set; } = null!;
    public int SeverityScale { get; set; } // 1 - 10
    public string AiTriageResult { get; set; } = "PendingTriage"; // Low, Medium, High, PendingTriage
    public string? AiRecommendation { get; set; }
    public DateTime LoggedAt { get; set; }

    // Soft delete implementation
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
