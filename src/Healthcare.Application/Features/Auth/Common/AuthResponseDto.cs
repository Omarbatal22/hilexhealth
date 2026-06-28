using System;

namespace Healthcare.Application.Features.Auth.Common;

public record AuthResponseDto
{
    public string AccessToken { get; init; } = null!;
    public string RefreshToken { get; init; } = null!;
    public DateTime ExpiresAt { get; init; }
    public Guid UserId { get; init; }
    public string Email { get; init; } = null!;
    public string Role { get; init; } = null!;
}
