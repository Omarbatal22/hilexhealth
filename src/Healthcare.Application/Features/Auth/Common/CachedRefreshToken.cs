using System;

namespace Healthcare.Application.Features.Auth.Common;

public class CachedRefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public string? ReplacedByToken { get; set; }
    
    // User metadata needed for authentication response
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool UserIsDeleted { get; set; }
}
