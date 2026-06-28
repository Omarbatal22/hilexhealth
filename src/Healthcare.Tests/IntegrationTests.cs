using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Healthcare.Domain.Entities;
using Healthcare.Persistence;
using Xunit;

namespace Healthcare.Tests;

public class IntegrationTests : IClassFixture<PostgresTestFixture>
{
    private readonly PostgresTestFixture _fixture;

    public IntegrationTests(PostgresTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task AuditAndSoftDelete_ShouldWorkCorrectly_InPostgres()
    {
        if (!_fixture.IsDockerAvailable)
        {
            // Skip test gracefully if docker is not running/accessible
            return;
        }

        // 1. Create DB and run migrations
        using var context = _fixture.CreateDbContext();
        await context.Database.EnsureCreatedAsync();

        // 2. Add an entity (Patient) and check if Audit log is created
        var patient = new Patient
        {
            FirstName = "Alice",
            LastName = "Smith",
            DateOfBirth = new DateTime(1990, 5, 15, 0, 0, 0, DateTimeKind.Utc),
            PhoneNumber = "555-0199",
            BiologicalSex = "Female",
            EmergencyContactName = "Bob Smith",
            EmergencyContactPhone = "555-0188"
        };

        context.Patients.Add(patient);
        await context.SaveChangesAsync();

        // Verify patient was saved
        var savedPatient = await context.Patients.FirstOrDefaultAsync(p => p.Id == patient.Id);
        Assert.NotNull(savedPatient);

        // Verify that audit log was generated
        var audit = await context.AuditLogs.FirstOrDefaultAsync(a => a.EntityId == patient.Id);
        Assert.NotNull(audit);
        Assert.Equal("Added", audit.Action);
        Assert.Equal("Patient", audit.EntityName);

        // 3. Soft Delete and check if record is hidden
        context.Patients.Remove(patient);
        await context.SaveChangesAsync();

        // Patient should not be found via standard query due to global query filters
        var deletedPatient = await context.Patients.FirstOrDefaultAsync(p => p.Id == patient.Id);
        Assert.Null(deletedPatient);

        // Verify that in DB, IsDeleted is indeed true
        var rawDeletedPatient = await context.Patients
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == patient.Id);
        Assert.NotNull(rawDeletedPatient);
        Assert.True(rawDeletedPatient.IsDeleted);
    }
}
