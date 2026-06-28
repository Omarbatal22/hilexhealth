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

namespace Healthcare.Persistence.Interceptors;

public class ConvertDomainEventsToOutboxMessagesInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        ConvertDomainEvents(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context == null) return base.SavingChanges(eventData, result);

        ConvertDomainEvents(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    private void ConvertDomainEvents(DbContext context)
    {
        var baseEntities = context.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var userEntities = context.ChangeTracker.Entries<User>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = new List<DomainEvent>();

        domainEvents.AddRange(baseEntities.SelectMany(e => e.DomainEvents));
        domainEvents.AddRange(userEntities.SelectMany(e => e.DomainEvents));

        // Clear events first to prevent loops
        foreach (var entity in baseEntities)
        {
            entity.ClearDomainEvents();
        }

        foreach (var entity in userEntities)
        {
            entity.ClearDomainEvents();
        }

        var serializeOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };

        var outboxMessages = domainEvents.Select(domainEvent => new OutboxMessage
        {
            Id = Guid.NewGuid(),
            OccurredOnUtc = domainEvent.DateOccurred,
            Type = domainEvent.GetType().AssemblyQualifiedName ?? domainEvent.GetType().FullName!,
            Content = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), serializeOptions)
        }).ToList();

        context.Set<OutboxMessage>().AddRange(outboxMessages);
    }
}
