using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Auth.Commands.Login;
using Healthcare.Application.Features.Auth.Commands.RefreshToken;
using Healthcare.Application.Features.Files.Queries.DownloadFile;
using Healthcare.Domain.Entities;
using Healthcare.Persistence;
using Healthcare.Application.Features.Auth.Common;

namespace Healthcare.Tests;

public class SecurityTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly Mock<ICacheService> _mockCacheService;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IFileStorageService> _mockFileStorageService;

    public SecurityTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        var store = new UserStore<User, IdentityRole<Guid>, ApplicationDbContext, Guid>(_context);
        
        // Setup Identity Options with actual lockout configured
        var identityOptions = new IdentityOptions();
        identityOptions.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        identityOptions.Lockout.MaxFailedAccessAttempts = 3; // set to 3 for fast testing
        identityOptions.Lockout.AllowedForNewUsers = true;

        var optionsAccessor = Options.Create(identityOptions);
        var passwordHasher = new PasswordHasher<User>();
        var userValidators = new IUserValidator<User>[] { new UserValidator<User>() };
        var passwordValidators = new IPasswordValidator<User>[] { new PasswordValidator<User>() };
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

        _mockTokenService = new Mock<ITokenService>();
        _mockCacheService = new Mock<ICacheService>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockFileStorageService = new Mock<IFileStorageService>();
    }

    [Fact]
    public async Task Login_FailedAttempts_LocksOutAccount()
    {
        // Arrange
        var user = new User
        {
            UserName = "lockout@test.com",
            Email = "lockout@test.com",
            Role = "Patient",
            LockoutEnabled = true
        };
        await _userManager.CreateAsync(user, "Password123!");

        var handler = new LoginCommandHandler(_userManager, _mockTokenService.Object);
        var loginCommand = new LoginCommand
        {
            Email = "lockout@test.com",
            Password = "WrongPassword",
            IpAddress = "127.0.0.1",
            UserAgent = "TestAgent"
        };

        // Act & Assert failed attempts increment
        for (int i = 0; i < 3; i++)
        {
            await Assert.ThrowsAsync<ValidationException>(() => 
                handler.Handle(loginCommand, CancellationToken.None));
        }

        // The user should now be locked out
        Assert.True(await _userManager.IsLockedOutAsync(user));

        // Attempt login with correct password while locked out
        var lockedCommand = new LoginCommand
        {
            Email = "lockout@test.com",
            Password = "Password123!",
            IpAddress = "127.0.0.1",
            UserAgent = "TestAgent"
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() => 
            handler.Handle(lockedCommand, CancellationToken.None));
        
        Assert.Contains("Account is locked", ex.Errors.First().ErrorMessage);
    }

    [Fact]
    public async Task DownloadFile_UnauthorizedUser_ThrowsForbiddenAccessException()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var fileMetadata = new FileMetadata
        {
            Id = fileId,
            FileName = "private.pdf",
            ContentType = "application/pdf",
            StoragePath = "/uploads/private.pdf",
            AccessLevel = "Private",
            UploaderId = Guid.NewGuid() // Different uploader
        };
        _context.FileMetadata.Add(fileMetadata);
        await _context.SaveChangesAsync();

        // Requester is a different non-admin user
        _mockCurrentUserService.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _mockCurrentUserService.Setup(c => c.Roles).Returns(new List<string> { "Patient" });

        var handler = new DownloadFileQueryHandler(_context, _mockFileStorageService.Object, _mockCurrentUserService.Object);
        var query = new DownloadFileQuery(fileId);

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenAccessException>(() => 
            handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task RefreshToken_Reuse_RevokesAllSessions()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            UserName = "theft@test.com",
            Email = "theft@test.com",
            Role = "Patient",
            PasswordHash = "dummy_hash"
        };
        _context.Users.Add(user);

        var token1 = new RefreshToken
        {
            UserId = userId,
            Token = "used-token",
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            IsRevoked = true // Already used/revoked
        };
        var token2 = new RefreshToken
        {
            UserId = userId,
            Token = "active-token",
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            IsRevoked = false
        };
        _context.RefreshTokens.AddRange(token1, token2);
        await _context.SaveChangesAsync();

        // Configure cache to return the reused token as revoked
        var cachedToken = new CachedRefreshToken
        {
            Id = token1.Id,
            UserId = userId,
            Token = "used-token",
            ExpiresAt = token1.ExpiresAt,
            IsRevoked = true,
            Email = user.Email,
            Role = user.Role
        };
        _mockCacheService
            .Setup(c => c.GetAsync<CachedRefreshToken>("refreshtoken:used-token", It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedToken);

        var handler = new RefreshTokenCommandHandler(_context, _mockTokenService.Object, _mockCacheService.Object);
        var command = new RefreshTokenCommand
        {
            RefreshToken = "used-token",
            IpAddress = "127.0.0.1",
            UserAgent = "TestAgent"
        };

        // Act & Assert reuse throws
        var ex = await Assert.ThrowsAsync<ValidationException>(() => 
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("reuse detected", ex.Errors.First().ErrorMessage);

        // Verify active sessions (token2) have been revoked in database
        var dbToken2 = await _context.RefreshTokens.FirstAsync(t => t.Token == "active-token");
        Assert.True(dbToken2.IsRevoked);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
