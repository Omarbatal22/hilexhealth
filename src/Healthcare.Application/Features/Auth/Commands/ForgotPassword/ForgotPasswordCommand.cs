using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand : IRequest
{
    public string Email { get; init; } = null!;
}

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(UserManager<User> userManager, IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Do not reveal that the user does not exist to prevent user enumeration
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        
        // In a real application, you would send a link containing the token to the user
        var resetLink = $"https://healthcare-system.com/reset-password?email={request.Email}&token={System.Uri.EscapeDataString(token)}";
        var subject = "Reset Your Password";
        var body = $"Please reset your password by clicking here: <a href=\"{resetLink}\">Reset Password</a><br/><br/>If you did not request this, please ignore this email.";

        await _emailService.SendEmailAsync(user.Email!, subject, body, cancellationToken);
    }
}
