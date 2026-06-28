using System;
using System.Threading;
using System.Threading.Tasks;
using Healthcare.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Healthcare.Infrastructure.Services;

public class PushService : IPushService
{
    private readonly ILogger<PushService> _logger;

    public PushService(ILogger<PushService> _logger)
    {
        this._logger = _logger;
    }

    public Task SendPushNotificationAsync(Guid userId, string title, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulated Push Notification Sent to User: {UserId}, Title: {Title}", userId, title);
        return Task.CompletedTask;
    }
}
