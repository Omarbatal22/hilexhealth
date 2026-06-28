using System;

namespace Healthcare.Application.Features.Doctors.Queries;

public record DoctorDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = null!;
    public string LastName { get; init; } = null!;
    public string Specialty { get; init; } = null!;
    public string PhoneNumber { get; init; } = null!;
    public string LicenseNumber { get; init; } = null!;
    public bool IsVerified { get; init; }
}
