using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Symptoms.Queries.GetPatientSymptoms;

public record GetPatientSymptomsQuery(Guid PatientId) : IRequest<IReadOnlyList<SymptomDto>>;

public class GetPatientSymptomsQueryHandler : IRequestHandler<GetPatientSymptomsQuery, IReadOnlyList<SymptomDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPatientSymptomsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SymptomDto>> Handle(GetPatientSymptomsQuery request, CancellationToken cancellationToken)
    {
        var symptoms = await _context.Symptoms
            .Where(s => s.PatientId == request.PatientId)
            .OrderByDescending(s => s.LoggedAt)
            .Select(s => new SymptomDto
            {
                Id = s.Id,
                PatientId = s.PatientId,
                Description = s.Description,
                SeverityScale = s.SeverityScale,
                AiTriageResult = s.AiTriageResult,
                AiRecommendation = s.AiRecommendation,
                LoggedAt = s.LoggedAt
            })
            .ToListAsync(cancellationToken);

        return symptoms;
    }
}
