using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Jobs;

[DisallowConcurrentExecution]
public class SendNotificationsJob : IJob
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly IPushService _pushService;
    private readonly ILogger<SendNotificationsJob> _logger;

    public SendNotificationsJob(
        IApplicationDbContext context,
        IEmailService emailService,
        ISmsService smsService,
        IPushService pushService,
        ILogger<SendNotificationsJob> logger)
    {
        _context = context;
        _emailService = emailService;
        _smsService = smsService;
        _pushService = pushService;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting SendNotifications job.");

        var pendingNotifications = await _context.Notifications
            .Where(n => n.Status == "Pending" && n.RetryCount < 3)
            .OrderBy(n => n.CreatedAt)
            .Take(20)
            .ToListAsync(context.CancellationToken);

        if (!pendingNotifications.Any())
        {
            _logger.LogInformation("No pending notifications found.");
            return;
        }

        foreach (var notification in pendingNotifications)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Patient)
                    .Include(u => u.Doctor)
                    .FirstOrDefaultAsync(u => u.Id == notification.UserId, context.CancellationToken);

                if (user == null)
                {
                    _logger.LogWarning("User not found for notification {Id}", notification.Id);
                    notification.Status = "Failed";
                    notification.Error = "User not found";
                    continue;
                }

                if (notification.Channel.Equals("Email", StringComparison.OrdinalIgnoreCase))
                {
                    await _emailService.SendEmailAsync(user.Email!, notification.Type, notification.Content, context.CancellationToken);
                    notification.Status = "Sent";
                }
                else if (notification.Channel.Equals("SMS", StringComparison.OrdinalIgnoreCase))
                {
                    var phone = user.Role == "Patient" ? user.Patient?.PhoneNumber : user.Doctor?.PhoneNumber;
                    if (!string.IsNullOrEmpty(phone))
                    {
                        await _smsService.SendSmsAsync(phone, notification.Content, context.CancellationToken);
                        notification.Status = "Sent";
                    }
                    else
                    {
                        _logger.LogWarning("No phone number found for SMS notification {Id}", notification.Id);
                        notification.Status = "Failed";
                        notification.Error = "No phone number found";
                    }
                }
                else if (notification.Channel.Equals("Push", StringComparison.OrdinalIgnoreCase))
                {
                    await _pushService.SendPushNotificationAsync(user.Id, notification.Type, notification.Content, context.CancellationToken);
                    notification.Status = "Sent";
                }
                else
                {
                    _logger.LogWarning("Unknown notification channel: {Channel} for {Id}", notification.Channel, notification.Id);
                    notification.Status = "Failed";
                    notification.Error = $"Unknown notification channel: {notification.Channel}";
                }

                if (notification.Status == "Sent")
                {
                    notification.SentAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification {Id}", notification.Id);
                notification.RetryCount++;
                notification.Error = ex.ToString();
                if (notification.RetryCount >= 3)
                {
                    notification.Status = "Failed";
                }
            }
        }

        await _context.SaveChangesAsync(context.CancellationToken);
    }
}
