using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;

namespace Healthcare.Domain.Events;

public class MessageSentEvent : DomainEvent
{
    public Message Message { get; }

    public MessageSentEvent(Message message)
    {
        Message = message;
    }
}
