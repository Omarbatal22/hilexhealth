using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Auth.Common;

namespace Healthcare.Application.Features.Auth.Commands.Login;

public record LoginCommand : IRequest<AuthResponseDto>
{
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
    public string IpAddress { get; init; } = "127.0.0.1";
    public string UserAgent { get; init; } = "Unknown";
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(UserManager<User> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        
        if (user == null || user.IsDeleted)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("Password", "Invalid email or password.") 
            });
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("Password", "Account is locked. Please try again later.") 
            });
        }

        var isPasswordCorrect = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordCorrect)
        {
            await _userManager.AccessFailedAsync(user);
            
            if (await _userManager.IsLockedOutAsync(user))
            {
                throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
                { 
                    new ValidationError("Password", "Account is locked due to too many failed attempts.") 
                });
            }

            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("Password", "Invalid email or password.") 
            });
        }

        await _userManager.ResetAccessFailedCountAsync(user);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user, request.IpAddress, request.UserAgent);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60), // standard token expiry time
            UserId = user.Id,
            Email = user.Email!,
            Role = user.Role
        };
    }
}
