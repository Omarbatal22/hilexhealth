using System;
using System.Collections.Generic;
using System.Linq;
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

public class ConcurrencyTests : IClassFixture<PostgresTestFixture>
{
    private readonly PostgresTestFixture _fixture;

    public ConcurrencyTests(PostgresTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateAppointment_ConcurrentRequests_EnforcesSingleSuccess()
    {
        if (!_fixture.IsDockerAvailable)
        {
            // Skip test gracefully if docker is not running/accessible
            return;
        }

        // 1. Initialize Database
        using var context = _fixture.CreateDbContext();
        await context.Database.EnsureCreatedAsync();

        // Seed Patient and Doctor
        var doctorId = Guid.NewGuid();
        var doctor = new Doctor 
        { 
            Id = doctorId, 
            FirstName = "Concurrency", 
            LastName = "Doctor", 
            LicenseNumber = "CONC123", 
            Specialty = "General", 
            PhoneNumber = "123456" 
        };
        context.Doctors.Add(doctor);

        var patients = new List<Patient>();
        for (int i = 0; i < 10; i++)
        {
            var p = new Patient 
            { 
                Id = Guid.NewGuid(), 
                FirstName = $"Patient_{i}", 
                LastName = "Test", 
                DateOfBirth = DateTime.UtcNow.AddYears(-30), 
                BiologicalSex = "Male", 
                PhoneNumber = $"555-00{i}",
                EmergencyContactName = "Emergency",
                EmergencyContactPhone = "123"
            };
            context.Patients.Add(p);
            patients.Add(p);
        }
        await context.SaveChangesAsync();

        // 2. Prepare 10 concurrent requests for the exact same timeslot
        var appointmentTime = DateTime.UtcNow.Date.AddDays(5).AddHours(10); // Future slot
        var mediatorMock = new Mock<IMediator>();

        var tasks = patients.Select(async p =>
        {
            // Create a dedicated DbContext for each concurrent request
            using var requestContext = _fixture.CreateDbContext();
            var handler = new CreateAppointmentCommandHandler(requestContext, mediatorMock.Object);

            var command = new CreateAppointmentCommand
            {
                PatientId = p.Id,
                DoctorId = doctorId,
                AppointmentDate = appointmentTime,
                DurationMinutes = 30,
                Reason = "Routine check"
            };

             try
            {
                await handler.Handle(command, CancellationToken.None);
                return (Success: true, Error: (Exception?)null);
            }
            catch (Exception ex)
            {
                return (Success: false, Error: ex);
            }
        }).ToList();

        // Execute concurrent requests
        var results = await Task.WhenAll(tasks);

        var successCount = results.Count(r => r.Success);
        var conflictCount = results.Count(r => !r.Success && r.Error is Healthcare.Application.Common.Exceptions.ValidationException);

        // 3. Verify exactly 1 succeeded and 9 failed due to double-booking conflict
        Assert.Equal(1, successCount);
        Assert.Equal(9, conflictCount);
    }
}
