using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;

namespace Healthcare.Domain.Events;

public class TriageAssessmentCreatedEvent : DomainEvent
{
    public TriageAssessment Assessment { get; }

    public TriageAssessmentCreatedEvent(TriageAssessment assessment)
    {
        Assessment = assessment;
    }
}
