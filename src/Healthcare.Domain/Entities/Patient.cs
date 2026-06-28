using System;
using System.Collections.Generic;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class Patient : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string BiologicalSex { get; set; } = null!; // Male, Female, Other
    public string? BloodType { get; set; }
    public string EmergencyContactName { get; set; } = null!;
    public string EmergencyContactPhone { get; set; } = null!;

    // Navigation properties
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Symptom> Symptoms { get; set; } = new List<Symptom>();

    // Soft delete implementation
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
