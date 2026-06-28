using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Features.Messages.Commands.SendMessage;
using Healthcare.Application.Features.Messages.Queries.GetConversation;
using Healthcare.Application.Features.Messages.Queries;

namespace Healthcare.API.Controllers;

[Authorize]
public class MessagesController : ApiControllerBase
{
    [HttpGet("appointment/{appointmentId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetConversation(Guid appointmentId)
    {
        var result = await Mediator.Send(new GetConversationQuery(appointmentId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Send(SendMessageCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }
}
