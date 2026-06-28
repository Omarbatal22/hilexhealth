using System;
using Healthcare.Domain.Common;
using Healthcare.Domain.Enums;

namespace Healthcare.Domain.Entities;

public class TriageAssessment : AuditableEntity, ISoftDelete
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    
    public string SymptomDescription { get; set; } = null!;
    public string ExtractedSymptoms { get; set; } = null!; // JSON representation of keywords/symptoms
    public UrgencyLevel UrgencyLevel { get; set; }
    public string Recommendation { get; set; } = null!;
    public double Confidence { get; set; }

    public Guid? ModelVersionId { get; set; }
    public ModelVersion? ModelVersion { get; set; }

    // Escalation workflow
    public bool IsEscalated { get; set; }
    public Guid? EscalatedToDoctorId { get; set; }
    public Doctor? EscalatedToDoctor { get; set; }
    public DateTime? EscalatedAt { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
