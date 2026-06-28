using System.Threading;
using System.Threading.Tasks;
using Healthcare.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Healthcare.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> _logger)
    {
        this._logger = _logger;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulated Email Sent to: {To}, Subject: {Subject}", to, subject);
        return Task.CompletedTask;
    }
}
