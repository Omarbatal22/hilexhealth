using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Features.Auth.Commands.RegisterPatient;
using Healthcare.Application.Features.Auth.Commands.Login;
using Healthcare.Application.Features.Auth.Commands.RefreshToken;
using Healthcare.Application.Features.Auth.Commands.Logout;
using Healthcare.Application.Features.Auth.Commands.ForgotPassword;
using Healthcare.Application.Features.Auth.Commands.ResetPassword;
using Healthcare.Application.Features.Auth.Commands.VerifyEmail;
using Healthcare.Application.Features.Auth.Common;

namespace Healthcare.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
[Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("AuthRateLimit")]
public class AuthController : ApiControllerBase
{
    [HttpPost("register/patient")]
    public async Task<ActionResult<Guid>> RegisterPatient([FromBody] RegisterPatientCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginCommand command)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var userAgent = Request.Headers["User-Agent"].ToString() ?? "Unknown";

        var commandWithDetails = command with 
        { 
            IpAddress = ipAddress, 
            UserAgent = userAgent 
        };

        var result = await Mediator.Send(commandWithDetails);
        return Ok(result);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var userAgent = Request.Headers["User-Agent"].ToString() ?? "Unknown";

        var commandWithDetails = command with 
        { 
            IpAddress = ipAddress, 
            UserAgent = userAgent 
        };

        var result = await Mediator.Send(commandWithDetails);
        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutCommand command)
    {
        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        await Mediator.Send(command);
        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        await Mediator.Send(command);
        return Ok();
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
    {
        await Mediator.Send(command);
        return Ok();
    }
}
