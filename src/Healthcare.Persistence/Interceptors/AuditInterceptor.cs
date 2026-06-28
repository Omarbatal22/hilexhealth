using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Persistence.Interceptors;

public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeProvider _dateTime;

    public AuditInterceptor(ICurrentUserService currentUserService, IDateTimeProvider dateTime)
    {
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        OnBeforeSavingChanges(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context == null) return base.SavingChanges(eventData, result);

        OnBeforeSavingChanges(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    private void OnBeforeSavingChanges(DbContext context)
    {
        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            // Handle IAuditable audit fields mapping
            if (entry.Entity is IAuditable auditableEntity)
            {
                if (entry.State == EntityState.Added)
                {
                    auditableEntity.CreatedAt = _dateTime.UtcNow;
                    auditableEntity.CreatedBy = _currentUserService.UserId;
                }
                else if (entry.State == EntityState.Modified)
                {
                    auditableEntity.UpdatedAt = _dateTime.UtcNow;
                    auditableEntity.UpdatedBy = _currentUserService.UserId;
                }
            }

            // Capture state changes for AuditLogs
            var auditEntry = new AuditEntry(entry)
            {
                UserId = _currentUserService.UserId,
                Action = entry.State.ToString(),
                EntityName = entry.Entity.GetType().Name,
                Timestamp = _dateTime.UtcNow,
                IpAddress = _currentUserService.IpAddress,
                UserAgent = _currentUserService.UserAgent,
                CorrelationId = _currentUserService.CorrelationId
            };

            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }
        }

        foreach (var auditEntry in auditEntries)
        {
            context.Set<AuditLog>().Add(auditEntry.ToAuditLog());
        }
    }
}

internal class AuditEntry
{
    public Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry { get; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = null!;
    public string EntityName { get; set; } = null!;
    public Dictionary<string, object?> KeyValues { get; } = new();
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? CorrelationId { get; set; }

    public AuditEntry(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        Entry = entry;
    }

    public AuditLog ToAuditLog()
    {
        // Try parsing primary key ID
        var entityId = Guid.Empty;
        var idVal = KeyValues.Values.FirstOrDefault();
        if (idVal is Guid guidId)
        {
            entityId = guidId;
        }

        return new AuditLog
        {
            UserId = UserId,
            Action = Action,
            EntityName = EntityName,
            EntityId = entityId,
            OldValues = OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
            NewValues = NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
            Timestamp = Timestamp,
            IpAddress = IpAddress,
            UserAgent = UserAgent,
            CorrelationId = CorrelationId
        };
    }
}
