using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Common.Models;
using Healthcare.Application.Features.Triage.Commands.SubmitTriageAssessment;
using Healthcare.Application.Features.Triage.Queries.GetTriageAssessment;
using Healthcare.Application.Features.Triage.Queries.ListTriageAssessments;

namespace Healthcare.API.Controllers;

[Authorize]
public class TriageController : ApiControllerBase
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public TriageController(ICurrentUserService currentUserService, IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Patient")]
    public async Task<ActionResult<Guid>> SubmitTriage(SubmitTriageAssessmentCommand command)
    {
        // For security, resolve patient from token/user context automatically
        var result = await Mediator.Send(command with { PatientId = Guid.Empty });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TriageAssessmentDto>> GetTriage(Guid id)
    {
        var assessment = await Mediator.Send(new GetTriageAssessmentQuery(id));

        // Enforce Row-Level Security: Patients can only retrieve their own triage records
        if (_currentUserService.Roles.Contains("Patient") && !_currentUserService.Roles.Contains("Admin") && !_currentUserService.Roles.Contains("Doctor"))
        {
            var userId = _currentUserService.UserId;
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null || assessment.PatientId != patient.Id)
            {
                return Forbid("You do not have permission to view this triage assessment.");
            }
        }

        return Ok(assessment);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedList<TriageAssessmentBriefDto>>> ListTriage([FromQuery] ListTriageAssessmentsQuery query)
    {
        // Enforce Row-Level Security: Patients can only query/list their own triage records
        if (_currentUserService.Roles.Contains("Patient") && !_currentUserService.Roles.Contains("Admin") && !_currentUserService.Roles.Contains("Doctor"))
        {
            var userId = _currentUserService.UserId;
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null)
            {
                return Forbid();
            }

            // Force query to only look up this patient's records
            query = query with { PatientId = patient.Id };
        }

        var result = await Mediator.Send(query);
        return Ok(result);
    }
}
