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

namespace Healthcare.Application.Features.Doctors.Commands.CreateDoctor;

public record CreateDoctorCommand : IRequest<Guid>
{
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
    public string FirstName { get; init; } = null!;
    public string LastName { get; init; } = null!;
    public string PhoneNumber { get; init; } = null!;
    public string Specialty { get; init; } = null!;
    public string LicenseNumber { get; init; } = null!;
}

public class CreateDoctorCommandValidator : AbstractValidator<CreateDoctorCommand>
{
    public CreateDoctorCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Specialty).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LicenseNumber).NotEmpty().MaximumLength(100);
    }
}

public class CreateDoctorCommandHandler : IRequestHandler<CreateDoctorCommand, Guid>
{
    private readonly UserManager<User> _userManager;
    private readonly IApplicationDbContext _context;

    public CreateDoctorCommandHandler(UserManager<User> userManager, IApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<Guid> Handle(CreateDoctorCommand request, CancellationToken cancellationToken)
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
            Role = "Doctor",
            IsEmailVerified = true // Admin created, auto-verify email
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var failures = result.Errors.Select(e => new ValidationError("Password", e.Description));
            throw new Healthcare.Application.Common.Exceptions.ValidationException(failures);
        }

        var doctor = new Doctor
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Specialty = request.Specialty,
            LicenseNumber = request.LicenseNumber
        };

        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
