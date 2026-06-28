using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Features.Appointments.Commands.CreateAppointment;
using Healthcare.Domain.Entities;
using Healthcare.Persistence;
using Xunit;

namespace Healthcare.Tests;

public class AppointmentModuleTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IMediator> _mediatorMock;

    public AppointmentModuleTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();
        _mediatorMock = new Mock<IMediator>();
    }

    [Fact]
    public async Task CreateAppointment_WithDoubleBooking_ThrowsValidationException()
    {
        // Arrange
        var patientId = Guid.NewGuid();
        var doctorId = Guid.NewGuid();

        // Seed doctor and patient in memory db
        var patient = new Patient { Id = patientId, FirstName = "John", LastName = "Doe", DateOfBirth = DateTime.UtcNow, BiologicalSex = "Male", PhoneNumber = "123", EmergencyContactName = "X", EmergencyContactPhone = "Y" };
        var doctor = new Doctor { Id = doctorId, FirstName = "Jane", LastName = "Smith", LicenseNumber = "L123", Specialty = "General", PhoneNumber = "456" };
        
        _context.Patients.Add(patient);
        _context.Doctors.Add(doctor);

        // Seed existing overlapping appointment
        var existingAppointment = new Appointment
        {
            PatientId = patientId,
            DoctorId = doctorId,
            AppointmentDate = DateTime.UtcNow.AddHours(2),
            DurationMinutes = 30,
            Reason = "Follow up",
            Status = "Booked"
        };
        _context.Appointments.Add(existingAppointment);
        await _context.SaveChangesAsync();

        var handler = new CreateAppointmentCommandHandler(_context, _mediatorMock.Object);

        // Command for overlapping appointment (same time)
        var command = new CreateAppointmentCommand
        {
            PatientId = patientId,
            DoctorId = doctorId,
            AppointmentDate = DateTime.UtcNow.AddHours(2).AddMinutes(15), // Overlapping!
            DurationMinutes = 30,
            Reason = "Checkup"
        };

        // Act & Assert
        await Assert.ThrowsAsync<Healthcare.Application.Common.Exceptions.ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAppointment_WhenAvailable_SucceedsAndPublishesEvent()
    {
        // Arrange
        var patientId = Guid.NewGuid();
        var doctorId = Guid.NewGuid();

        var patient = new Patient { Id = patientId, FirstName = "John", LastName = "Doe", DateOfBirth = DateTime.UtcNow, BiologicalSex = "Male", PhoneNumber = "123", EmergencyContactName = "X", EmergencyContactPhone = "Y" };
        var doctor = new Doctor { Id = doctorId, FirstName = "Jane", LastName = "Smith", LicenseNumber = "L123", Specialty = "General", PhoneNumber = "456" };
        
        _context.Patients.Add(patient);
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        var handler = new CreateAppointmentCommandHandler(_context, _mediatorMock.Object);

        var command = new CreateAppointmentCommand
        {
            PatientId = patientId,
            DoctorId = doctorId,
            AppointmentDate = DateTime.UtcNow.AddDays(1),
            DurationMinutes = 30,
            Reason = "Checkup"
        };

        // Act
        var appointmentId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, appointmentId);
        
        var created = await _context.Appointments.FindAsync(appointmentId);
        Assert.NotNull(created);
        Assert.Equal("Booked", created.Status);

        // Verify mediator published the event
        _mediatorMock.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
