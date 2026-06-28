using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Healthcare.Application.Features.Auth.Commands.RegisterPatient;
using Healthcare.Domain.Entities;
using Healthcare.Persistence;
using Xunit;

namespace Healthcare.Tests;

public class RegisterPatientTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;

    public RegisterPatientTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        var store = new UserStore<User, IdentityRole<Guid>, ApplicationDbContext, Guid>(_context);
        
        var optionsAccessor = Options.Create(new IdentityOptions());
        var passwordHasher = new PasswordHasher<User>();
        var userValidators = new IUserValidator<User>[0];
        var passwordValidators = new IPasswordValidator<User>[0];
        var keyNormalizer = new UpperInvariantLookupNormalizer();
        var errors = new IdentityErrorDescriber();
        var services = new ServiceCollection().BuildServiceProvider();
        var logger = new LoggerFactory().CreateLogger<UserManager<User>>();

        _userManager = new UserManager<User>(
            store, 
            optionsAccessor, 
            passwordHasher, 
            userValidators, 
            passwordValidators, 
            keyNormalizer, 
            errors, 
            services, 
            logger);
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesUserAndPatientProfile()
    {
        // Arrange
        var handler = new RegisterPatientCommandHandler(_userManager, _context);
        var command = new RegisterPatientCommand
        {
            Email = "patient@test.com",
            Password = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "1234567890",
            BiologicalSex = "Male",
            BloodType = "O+",
            DateOfBirth = DateTime.UtcNow.AddYears(-30),
            EmergencyContactName = "Jane Doe",
            EmergencyContactPhone = "0987654321"
        };

        // Act
        var userId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, userId);

        var user = await _userManager.FindByIdAsync(userId.ToString());
        Assert.NotNull(user);
        Assert.Equal("patient@test.com", user.Email);
        Assert.Equal("Patient", user.Role);

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
        Assert.NotNull(patient);
        Assert.Equal("John", patient.FirstName);
        Assert.Equal("Doe", patient.LastName);
        Assert.Equal("O+", patient.BloodType);
    }

    [Fact]
    public async Task Handle_ExistingEmail_ThrowsValidationException()
    {
        // Arrange
        var handler = new RegisterPatientCommandHandler(_userManager, _context);
        var existingUser = new User
        {
            UserName = "patient@test.com",
            Email = "patient@test.com",
            Role = "Patient"
        };
        await _userManager.CreateAsync(existingUser, "Password123!");

        var command = new RegisterPatientCommand
        {
            Email = "patient@test.com",
            Password = "NewPassword123!",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "1234567890",
            BiologicalSex = "Male",
            BloodType = "O+",
            DateOfBirth = DateTime.UtcNow.AddYears(-30),
            EmergencyContactName = "Jane Doe",
            EmergencyContactPhone = "0987654321"
        };

        // Act & Assert
        await Assert.ThrowsAsync<Healthcare.Application.Common.Exceptions.ValidationException>(() => 
            handler.Handle(command, CancellationToken.None));
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
