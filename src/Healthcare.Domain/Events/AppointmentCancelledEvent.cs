using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;

namespace Healthcare.Domain.Events;

public class AppointmentCancelledEvent : DomainEvent
{
    public Appointment Appointment { get; }

    public AppointmentCancelledEvent(Appointment appointment)
    {
        Appointment = appointment;
    }
}
