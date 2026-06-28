using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Infrastructure.Jobs;

[DisallowConcurrentExecution]
public class ProcessOutboxJob : IJob
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<ProcessOutboxJob> _logger;

    public ProcessOutboxJob(
        IApplicationDbContext context,
        IMediator mediator,
        ILogger<ProcessOutboxJob> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting Outbox processing job.");

        var messages = await _context.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null && m.RetryCount < 3)
            .OrderBy(m => m.OccurredOnUtc)
            .Take(20)
            .ToListAsync(context.CancellationToken);

        if (!messages.Any())
        {
            _logger.LogInformation("No pending Outbox messages found.");
            return;
        }

        foreach (var message in messages)
        {
            try
            {
                var type = Type.GetType(message.Type);
                if (type == null)
                {
                    _logger.LogWarning("Could not resolve type: {Type} for OutboxMessage {Id}", message.Type, message.Id);
                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = $"Type resolution failed: {message.Type}";
                    continue;
                }

                var domainEvent = JsonSerializer.Deserialize(message.Content, type) as INotification;
                if (domainEvent == null)
                {
                    _logger.LogWarning("Deserialized object is not an INotification: {Id}", message.Id);
                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = "Deserialization failed or not INotification";
                    continue;
                }

                await _mediator.Publish(domainEvent, context.CancellationToken);

                message.ProcessedOnUtc = DateTime.UtcNow;
                _logger.LogInformation("Successfully processed OutboxMessage {Id} ({Type})", message.Id, type.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process OutboxMessage {Id}", message.Id);
                message.RetryCount++;
                message.Error = ex.ToString();
            }
        }

        await _context.SaveChangesAsync(context.CancellationToken);
    }
}
