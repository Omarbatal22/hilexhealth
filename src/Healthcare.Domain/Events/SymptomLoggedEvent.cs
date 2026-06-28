using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;

namespace Healthcare.Domain.Events;

public class SymptomLoggedEvent : DomainEvent
{
    public Symptom Symptom { get; }

    public SymptomLoggedEvent(Symptom symptom)
    {
        Symptom = symptom;
    }
}
