using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Common.Models;
using Healthcare.Domain.Enums;

namespace Healthcare.Application.Features.Triage.Queries.ListTriageAssessments;

public record TriageAssessmentBriefDto(
    Guid Id,
    Guid PatientId,
    string PatientName,
    string SymptomDescription,
    UrgencyLevel UrgencyLevel,
    double Confidence,
    bool IsEscalated,
    DateTime CreatedAt);

public record ListTriageAssessmentsQuery : IRequest<PaginatedList<TriageAssessmentBriefDto>>
{
    public Guid? PatientId { get; init; }
    public UrgencyLevel? UrgencyLevel { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class ListTriageAssessmentsQueryHandler : IRequestHandler<ListTriageAssessmentsQuery, PaginatedList<TriageAssessmentBriefDto>>
{
    private readonly IApplicationDbContext _context;

    public ListTriageAssessmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<TriageAssessmentBriefDto>> Handle(ListTriageAssessmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TriageAssessments
            .Include(a => a.Patient)
            .AsNoTracking();

        if (request.PatientId.HasValue)
        {
            query = query.Where(a => a.PatientId == request.PatientId.Value);
        }

        if (request.UrgencyLevel.HasValue)
        {
            query = query.Where(a => a.UrgencyLevel == request.UrgencyLevel.Value);
        }

        query = query.OrderByDescending(a => a.CreatedAt);

        var dtoQuery = query.Select(a => new TriageAssessmentBriefDto(
            a.Id,
            a.PatientId,
            $"{a.Patient.FirstName} {a.Patient.LastName}",
            a.SymptomDescription.Length > 100 ? a.SymptomDescription.Substring(0, 97) + "..." : a.SymptomDescription,
            a.UrgencyLevel,
            a.Confidence,
            a.IsEscalated,
            a.CreatedAt
        ));

        return await PaginatedList<TriageAssessmentBriefDto>.CreateAsync(dtoQuery, request.PageNumber, request.PageSize, cancellationToken);
    }
}
