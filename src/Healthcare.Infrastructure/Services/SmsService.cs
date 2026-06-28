using System.Threading;
using System.Threading.Tasks;
using Healthcare.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Healthcare.Infrastructure.Services;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> _logger)
    {
        this._logger = _logger;
    }

    public Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulated SMS Sent to: {Phone}, Content: {Message}", phoneNumber, message);
        return Task.CompletedTask;
    }
}
