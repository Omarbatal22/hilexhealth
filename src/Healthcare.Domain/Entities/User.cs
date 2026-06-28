using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Healthcare.Domain.Common;

namespace Healthcare.Domain.Entities;

public class User : IdentityUser<Guid>, ISoftDelete, IAuditable
{
    public string Role { get; set; } = null!; // Patient, Doctor, Admin
    public bool IsEmailVerified { get; set; }
    public string? VerificationToken { get; set; }

    // Auditing properties (since we can't inherit from AuditableEntity)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    // Domain events tracking
    private readonly List<DomainEvent> _domainEvents = new();
    public IReadOnlyCollection<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    public void AddDomainEvent(DomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void RemoveDomainEvent(DomainEvent domainEvent) => _domainEvents.Remove(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();

    // Navigation properties
    public Patient? Patient { get; set; }
    public Doctor? Doctor { get; set; }
    
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<FileMetadata> UploadedFiles { get; set; } = new List<FileMetadata>();

    // Soft delete implementation
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
