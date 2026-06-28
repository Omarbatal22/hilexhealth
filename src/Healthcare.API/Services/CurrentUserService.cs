using System;
using System.Security.Claims;
using Healthcare.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Healthcare.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdClaim, out var parsedGuid) ? parsedGuid : null;
        }
    }

    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

    public System.Collections.Generic.IReadOnlyList<string> Roles
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return Array.Empty<string>();
            var roles = new System.Collections.Generic.List<string>();
            foreach (var claim in user.FindAll(ClaimTypes.Role))
            {
                roles.Add(claim.Value);
            }
            return roles;
        }
    }

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

    public string? UserAgent => _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString();

    public string? CorrelationId => _httpContextAccessor.HttpContext?.Request?.Headers["X-Correlation-ID"].ToString() 
        ?? _httpContextAccessor.HttpContext?.Response?.Headers["X-Correlation-ID"].ToString();
}
