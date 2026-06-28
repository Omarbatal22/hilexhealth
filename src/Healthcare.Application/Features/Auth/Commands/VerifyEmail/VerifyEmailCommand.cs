using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Exceptions;

namespace Healthcare.Application.Features.Auth.Commands.VerifyEmail;

public record VerifyEmailCommand : IRequest
{
    public Guid UserId { get; init; }
    public string Token { get; init; } = null!;
}

public class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>
{
    public VerifyEmailCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Token).NotEmpty();
    }
}

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand>
{
    private readonly UserManager<User> _userManager;

    public VerifyEmailCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
            {
                new ValidationError("UserId", "User not found.")
            });
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
        {
            var failures = result.Errors.Select(e => new ValidationError("Token", e.Description));
            throw new Healthcare.Application.Common.Exceptions.ValidationException(failures);
        }

        user.IsEmailVerified = true;
        await _userManager.UpdateAsync(user);
    }
}
