using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Features.Appointments.Commands.CreateAppointment;
using Healthcare.Application.Features.Appointments.Commands.UpdateAppointment;
using Healthcare.Application.Features.Appointments.Commands.CancelAppointment;
using Healthcare.Application.Features.Appointments.Commands.UpdateAppointmentStatus;
using Healthcare.Application.Features.Appointments.Commands.RescheduleAppointment;
using Healthcare.Application.Features.Appointments.Queries.GetAppointmentById;
using Healthcare.Application.Features.Appointments.Queries.GetPatientAppointments;
using Healthcare.Application.Features.Appointments.Queries.GetDoctorAppointments;
using Healthcare.Application.Features.Appointments.Queries;

namespace Healthcare.API.Controllers;

[Authorize]
public class AppointmentsController : ApiControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetAppointmentByIdQuery(id));
        return Ok(result);
    }

    [HttpGet("patient/{patientId}")]
    [HttpGet("/api/v1/patients/{patientId}/appointments")]
    public async Task<ActionResult<IReadOnlyList<AppointmentDto>>> GetByPatientId(Guid patientId)
    {
        var result = await Mediator.Send(new GetPatientAppointmentsQuery(patientId));
        return Ok(result);
    }

    [HttpGet("doctor/{doctorId}")]
    [HttpGet("/api/v1/doctors/{doctorId}/appointments")]
    public async Task<ActionResult<IReadOnlyList<AppointmentDto>>> GetByDoctorId(Guid doctorId)
    {
        var result = await Mediator.Send(new GetDoctorAppointmentsQuery(doctorId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateAppointmentCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateAppointmentCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID mismatch between route and request body.");
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> Cancel(Guid id, CancelAppointmentCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID mismatch between route and request body.");
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        await Mediator.Send(new UpdateAppointmentStatusCommand { Id = id, Status = request.Status });
        return NoContent();
    }

    [HttpPatch("{id}/reschedule")]
    public async Task<ActionResult> Reschedule(Guid id, [FromBody] RescheduleRequest request)
    {
        await Mediator.Send(new RescheduleAppointmentCommand { Id = id, AppointmentDate = request.DateTime });
        return NoContent();
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = null!;
    }

    public class RescheduleRequest
    {
        public DateTime DateTime { get; set; }
    }
}
