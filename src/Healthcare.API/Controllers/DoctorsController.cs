using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Doctors.Commands.CreateDoctor;
using Healthcare.Application.Features.Doctors.Queries.ListDoctors;
using Healthcare.Application.Features.Doctors.Queries.GetDoctorByUserId;
using Healthcare.Application.Features.Doctors.Queries;

namespace Healthcare.API.Controllers;

[Authorize]
public class DoctorsController : ApiControllerBase
{
    private readonly ICurrentUserService _currentUserService;

    public DoctorsController(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<DoctorDto>> GetCurrentDoctor()
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Unauthorized("User is not authenticated.");
        }

        var result = await Mediator.Send(new GetDoctorByUserIdQuery(userId.Value));
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<Healthcare.Application.Common.Models.PaginatedList<DoctorDto>>> List([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await Mediator.Send(new ListDoctorsQuery(pageNumber, pageSize));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<System.Guid>> Create(CreateDoctorCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }
}

