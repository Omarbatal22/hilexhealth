using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Enums;

namespace Healthcare.Application.Features.Triage.Queries.GetTriageAssessment;

public record TriageAssessmentDto(
    Guid Id,
    Guid PatientId,
    string PatientName,
    string BiologicalSex,
    DateTime PatientDateOfBirth,
    string SymptomDescription,
    string[] ExtractedSymptoms,
    UrgencyLevel UrgencyLevel,
    string Recommendation,
    double Confidence,
    string ModelName,
    bool IsEscalated,
    string? EscalatedToDoctorName,
    DateTime? EscalatedAt,
    DateTime CreatedAt);

public record GetTriageAssessmentQuery(Guid Id) : IRequest<TriageAssessmentDto>;

public class GetTriageAssessmentQueryHandler : IRequestHandler<GetTriageAssessmentQuery, TriageAssessmentDto>
{
    private readonly IApplicationDbContext _context;

    public GetTriageAssessmentQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TriageAssessmentDto> Handle(GetTriageAssessmentQuery request, CancellationToken cancellationToken)
    {
        var assessment = await _context.TriageAssessments
            .Include(a => a.Patient)
            .Include(a => a.ModelVersion)
            .Include(a => a.EscalatedToDoctor)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (assessment == null)
        {
            throw new NotFoundException(nameof(TriageAssessment), request.Id);
        }

        string[] symptoms = Array.Empty<string>();
        try
        {
            symptoms = JsonSerializer.Deserialize<string[]>(assessment.ExtractedSymptoms) ?? Array.Empty<string>();
        }
        catch { }

        return new TriageAssessmentDto(
            assessment.Id,
            assessment.PatientId,
            $"{assessment.Patient.FirstName} {assessment.Patient.LastName}",
            assessment.Patient.BiologicalSex,
            assessment.Patient.DateOfBirth,
            assessment.SymptomDescription,
            symptoms,
            assessment.UrgencyLevel,
            assessment.Recommendation,
            assessment.Confidence,
            assessment.ModelVersion?.Name ?? "triage_random_forest_v1.0",
            assessment.IsEscalated,
            assessment.EscalatedToDoctor != null ? $"{assessment.EscalatedToDoctor.FirstName} {assessment.EscalatedToDoctor.LastName}" : null,
            assessment.EscalatedAt,
            assessment.CreatedAt
        );
    }
}
