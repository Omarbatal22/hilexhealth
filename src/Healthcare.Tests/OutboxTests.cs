using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Quartz;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Events;
using Healthcare.Persistence;
using Healthcare.Persistence.Interceptors;
using Healthcare.Infrastructure.Jobs;
using Xunit;

namespace Healthcare.Tests;

public class OutboxTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<ILogger<ProcessOutboxJob>> _loggerMock;

    public OutboxTests()
    {
        // Register the interceptor
        var interceptor = new ConvertDomainEventsToOutboxMessagesInterceptor();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .AddInterceptors(interceptor)
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        _mediatorMock = new Mock<IMediator>();
        _loggerMock = new Mock<ILogger<ProcessOutboxJob>>();
    }

    [Fact]
    public async Task SaveChanges_ShouldConvertDomainEventsToOutboxMessages()
    {
        // Arrange
        var appointment = new Appointment
        {
            PatientId = Guid.NewGuid(),
            DoctorId = Guid.NewGuid(),
            AppointmentDate = DateTime.UtcNow.AddDays(1),
            DurationMinutes = 30,
            Reason = "Test",
            Status = "Booked"
        };

        // Manually raise a domain event
        var domainEvent = new AppointmentBookedEvent(appointment);
        appointment.AddDomainEvent(domainEvent);

        // Act
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        // Assert
        var outboxMessage = await _context.OutboxMessages.FirstOrDefaultAsync();
        Assert.NotNull(outboxMessage);
        Assert.Contains("AppointmentBookedEvent", outboxMessage.Type);
        Assert.Null(outboxMessage.ProcessedOnUtc);
        Assert.Equal(0, outboxMessage.RetryCount);
    }

    [Fact]
    public async Task ProcessOutboxJob_ShouldProcessPendingMessagesAndPublishToMediator()
    {
        // Arrange
        var appointment = new Appointment
        {
            PatientId = Guid.NewGuid(),
            DoctorId = Guid.NewGuid(),
            AppointmentDate = DateTime.UtcNow.AddDays(1),
            DurationMinutes = 30,
            Reason = "Test",
            Status = "Booked"
        };

        var domainEvent = new AppointmentBookedEvent(appointment);
        appointment.AddDomainEvent(domainEvent);

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var job = new ProcessOutboxJob(_context, _mediatorMock.Object, _loggerMock.Object);
        var mockContext = new Mock<IJobExecutionContext>();

        // Act
        await job.Execute(mockContext.Object);

        // Assert
        var outboxMessage = await _context.OutboxMessages.FirstOrDefaultAsync();
        Assert.NotNull(outboxMessage);
        Assert.NotNull(outboxMessage.ProcessedOnUtc);
        Assert.Null(outboxMessage.Error);

        _mediatorMock.Verify(m => m.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ProcessOutboxJob_ShouldIncrementRetryCountOnFailure()
    {
        // Arrange
        var appointment = new Appointment
        {
            PatientId = Guid.NewGuid(),
            DoctorId = Guid.NewGuid(),
            AppointmentDate = DateTime.UtcNow.AddDays(1),
            DurationMinutes = 30,
            Reason = "Test",
            Status = "Booked"
        };

        var domainEvent = new AppointmentBookedEvent(appointment);
        appointment.AddDomainEvent(domainEvent);

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        // Setup Mediator to fail on Publish
        _mediatorMock
            .Setup(m => m.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Simulated publish failure"));

        var job = new ProcessOutboxJob(_context, _mediatorMock.Object, _loggerMock.Object);
        var mockContext = new Mock<IJobExecutionContext>();

        // Act
        await job.Execute(mockContext.Object);

        // Assert
        var outboxMessage = await _context.OutboxMessages.FirstOrDefaultAsync();
        Assert.NotNull(outboxMessage);
        Assert.Null(outboxMessage.ProcessedOnUtc); // Not processed
        Assert.Equal(1, outboxMessage.RetryCount); // Incremented
        Assert.Contains("Simulated publish failure", outboxMessage.Error);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
