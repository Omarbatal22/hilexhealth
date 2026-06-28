using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Infrastructure.Services;

public class PredictionLoggingService : IPredictionLoggingService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PredictionLoggingService> _logger;

    public PredictionLoggingService(IServiceProvider serviceProvider, ILogger<PredictionLoggingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task LogPredictionAsync(AiPredictionLog log, CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            context.AiPredictionLogs.Add(log);
            await context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "AI Prediction Logged. CorrelationId: {CorrelationId}, Urgency: {Urgency}, Confidence: {Confidence:P2}",
                log.CorrelationId, log.UrgencyLevel, log.Confidence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log AI prediction event for correlation {CorrelationId}", log.CorrelationId);
        }
    }
}
