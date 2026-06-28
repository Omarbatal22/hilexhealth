using System;

namespace Healthcare.Application.Features.Patients.Queries;

public record PatientDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = null!;
    public string LastName { get; init; } = null!;
    public DateTime DateOfBirth { get; init; }
    public string PhoneNumber { get; init; } = null!;
    public string BiologicalSex { get; init; } = null!;
    public string? BloodType { get; init; }
    public string EmergencyContactName { get; init; } = null!;
    public string EmergencyContactPhone { get; init; } = null!;
}
