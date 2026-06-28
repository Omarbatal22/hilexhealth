using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Auth.Common;

namespace Healthcare.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand : IRequest<AuthResponseDto>
{
    public string RefreshToken { get; init; } = null!;
    public string IpAddress { get; init; } = "127.0.0.1";
    public string UserAgent { get; init; } = "Unknown";
}

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ICacheService _cacheService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService, ICacheService cacheService)
    {
        _context = context;
        _tokenService = tokenService;
        _cacheService = cacheService;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var cacheKey = $"refreshtoken:{request.RefreshToken}";
        var cachedToken = await _cacheService.GetAsync<CachedRefreshToken>(cacheKey, cancellationToken);

        if (cachedToken != null)
        {
            if (cachedToken.IsRevoked)
            {
                // Theft protection! Revoke all tokens.
                await RevokeAllUserTokensAsync(cachedToken.UserId, cancellationToken);
                throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
                {
                    new ValidationError("RefreshToken", "Token reuse detected. All sessions revoked for safety.")
                });
            }

            if (DateTime.UtcNow >= cachedToken.ExpiresAt || cachedToken.UserIsDeleted)
            {
                throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
                {
                    new ValidationError("RefreshToken", "Invalid or expired refresh token.")
                });
            }
        }

        // Fetch user & stored token to perform database updates
        var storedToken = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

        if (storedToken == null || storedToken.User.IsDeleted)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
            {
                new ValidationError("RefreshToken", "Invalid or expired refresh token.")
            });
        }

        if (storedToken.IsRevoked)
        {
            // Theft protection! Revoke all tokens.
            await RevokeAllUserTokensAsync(storedToken.UserId, cancellationToken);
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
            {
                new ValidationError("RefreshToken", "Token reuse detected. All sessions revoked for safety.")
            });
        }

        if (DateTime.UtcNow >= storedToken.ExpiresAt)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
            {
                new ValidationError("RefreshToken", "Invalid or expired refresh token.")
            });
        }

        // Generate new tokens
        var newAccessToken = _tokenService.GenerateAccessToken(storedToken.User);
        var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(storedToken.User, request.IpAddress, request.UserAgent);

        // Revoke the old token in database
        storedToken.IsRevoked = true;
        storedToken.ReplacedByToken = newRefreshToken;
        _context.RefreshTokens.Update(storedToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Update the old token in cache to show it's revoked & replaced (for theft detection)
        var updatedCacheToken = new CachedRefreshToken
        {
            Id = storedToken.Id,
            UserId = storedToken.UserId,
            Token = storedToken.Token,
            ExpiresAt = storedToken.ExpiresAt,
            IsRevoked = true,
            ReplacedByToken = newRefreshToken,
            Email = storedToken.User.Email ?? string.Empty,
            Role = storedToken.User.Role,
            UserIsDeleted = storedToken.User.IsDeleted
        };
        await _cacheService.SetAsync(cacheKey, updatedCacheToken, TimeSpan.FromDays(7), cancellationToken);

        return new AuthResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            UserId = storedToken.User.Id,
            Email = storedToken.User.Email!,
            Role = storedToken.User.Role
        };
    }

    private async Task RevokeAllUserTokensAsync(Guid userId, CancellationToken cancellationToken)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(t => t.UserId == userId && !t.IsRevoked)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
            
            // Invalidate/revoke cache entry too
            var cacheKey = $"refreshtoken:{token.Token}";
            await _cacheService.RemoveAsync(cacheKey, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
