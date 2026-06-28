using System;
using MediatR;

namespace Healthcare.Domain.Common;

public abstract class DomainEvent : INotification
{
    public DateTime DateOccurred { get; protected set; } = DateTime.UtcNow;
}
