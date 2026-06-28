using System;

namespace Healthcare.Application.Features.Appointments.Queries;

public record AppointmentDto
{
    public Guid Id { get; init; }
    public Guid PatientId { get; init; }
    public string PatientName { get; init; } = null!;
    public Guid DoctorId { get; init; }
    public string DoctorName { get; init; } = null!;
    public DateTime AppointmentDate { get; init; }
    public int DurationMinutes { get; init; }
    public string Reason { get; init; } = null!;
    public string Status { get; init; } = null!;
    public string? CancellationReason { get; init; }
}
