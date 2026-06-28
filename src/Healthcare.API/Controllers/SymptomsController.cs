using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Features.Symptoms.Commands.LogSymptom;
using Healthcare.Application.Features.Symptoms.Commands.UpdateSymptom;
using Healthcare.Application.Features.Symptoms.Queries.GetPatientSymptoms;
using Healthcare.Application.Features.Symptoms.Queries;

namespace Healthcare.API.Controllers;

[Authorize]
public class SymptomsController : ApiControllerBase
{
    [HttpGet("patient/{patientId}")]
    [HttpGet("/api/v1/patients/{patientId}/symptoms")]
    public async Task<ActionResult<IReadOnlyList<SymptomDto>>> GetByPatientId(Guid patientId)
    {
        var result = await Mediator.Send(new GetPatientSymptomsQuery(patientId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(LogSymptomCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateSymptomCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID mismatch between route and request body.");
        }

        await Mediator.Send(command);
        return NoContent();
    }
}
