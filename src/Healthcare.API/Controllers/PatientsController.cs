using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Patients.Queries.GetPatientById;
using Healthcare.Application.Features.Patients.Queries.GetPatientByUserId;
using Healthcare.Application.Features.Patients.Queries;

namespace Healthcare.API.Controllers;

[Authorize]
public class PatientsController : ApiControllerBase
{
    private readonly ICurrentUserService _currentUserService;

    public PatientsController(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<PatientDto>> GetCurrentPatient()
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Unauthorized("User is not authenticated.");
        }

        var result = await Mediator.Send(new GetPatientByUserIdQuery(userId.Value));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetPatientByIdQuery(id));
        return Ok(result);
    }
}

