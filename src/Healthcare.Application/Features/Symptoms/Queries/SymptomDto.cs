using System;

namespace Healthcare.Application.Features.Symptoms.Queries;

public record SymptomDto
{
    public Guid Id { get; init; }
    public Guid PatientId { get; init; }
    public string Description { get; init; } = null!;
    public int SeverityScale { get; init; }
    public string AiTriageResult { get; init; } = null!;
    public string? AiRecommendation { get; init; }
    public DateTime LoggedAt { get; init; }
}
