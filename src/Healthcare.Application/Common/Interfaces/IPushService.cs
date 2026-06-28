using System;
using System.Threading;
using System.Threading.Tasks;

namespace Healthcare.Application.Common.Interfaces;

public interface IPushService
{
    Task SendPushNotificationAsync(Guid userId, string title, string body, CancellationToken cancellationToken = default);
}
