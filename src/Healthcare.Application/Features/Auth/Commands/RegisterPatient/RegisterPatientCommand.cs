using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Auth.Commands.RegisterPatient;

public record RegisterPatientCommand : IRequest<Guid>
{
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
    public string FirstName { get; init; } = null!;
    public string LastName { get; init; } = null!;
    public string PhoneNumber { get; init; } = null!;
    public string BiologicalSex { get; init; } = null!;
    public string? BloodType { get; init; }
    public DateTime DateOfBirth { get; init; }
    public string EmergencyContactName { get; init; } = null!;
    public string EmergencyContactPhone { get; init; } = null!;
}

public class RegisterPatientCommandValidator : AbstractValidator<RegisterPatientCommand>
{
    public RegisterPatientCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.BiologicalSex).NotEmpty().MaximumLength(10);
        RuleFor(x => x.BloodType).MaximumLength(5);
        RuleFor(x => x.DateOfBirth).NotEmpty().LessThan(DateTime.UtcNow);
        RuleFor(x => x.EmergencyContactName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EmergencyContactPhone).NotEmpty().MaximumLength(20);
    }
}

public class RegisterPatientCommandHandler : IRequestHandler<RegisterPatientCommand, Guid>
{
    private readonly UserManager<User> _userManager;
    private readonly IApplicationDbContext _context;

    public RegisterPatientCommandHandler(UserManager<User> userManager, IApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<Guid> Handle(RegisterPatientCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[] 
            { 
                new ValidationError("Email", "Email address is already registered.") 
            });
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            Role = "Patient",
            IsEmailVerified = false
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var failures = result.Errors.Select(e => new ValidationError("Password", e.Description));
            throw new Healthcare.Application.Common.Exceptions.ValidationException(failures);
        }

        var patient = new Patient
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            BiologicalSex = request.BiologicalSex,
            BloodType = request.BloodType,
            DateOfBirth = request.DateOfBirth,
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
