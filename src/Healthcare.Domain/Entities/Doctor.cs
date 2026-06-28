using System;
using System.Collections.Generic;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class Doctor : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Specialty { get; set; } = null!;
    public string LicenseNumber { get; set; } = null!;
    public bool IsVerified { get; set; }

    // Navigation properties
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    // Soft delete implementation
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
