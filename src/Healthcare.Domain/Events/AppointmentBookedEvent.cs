using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;

namespace Healthcare.Domain.Events;

public class AppointmentBookedEvent : DomainEvent
{
    public Appointment Appointment { get; }

    public AppointmentBookedEvent(Appointment appointment)
    {
        Appointment = appointment;
    }
}
