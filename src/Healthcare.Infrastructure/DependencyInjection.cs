using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Infrastructure.Services;
using Healthcare.Infrastructure.Jobs;
using Healthcare.Infrastructure.Health;

namespace Healthcare.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<IDateTimeProvider, DateTimeProvider>();
        services.AddTransient<IEmailService, EmailService>();
        services.AddTransient<ISmsService, SmsService>();
        services.AddTransient<IPushService, PushService>();
        services.AddTransient<IFileStorageService, FileStorageService>();
        services.AddSingleton<ISymptomExtractionService, SymptomExtractionService>();
        services.AddSingleton<IAiPredictionService, AiPredictionService>();
        services.AddSingleton<IModelManagementService, ModelManagementService>();
        services.AddSingleton<IPredictionLoggingService, PredictionLoggingService>();
        services.AddTransient<IAiTriageService, AiTriageService>();

        services.AddTransient<ITokenService, TokenService>();
        services.AddSingleton<IEncryptionService, AesEncryptionService>();

        // Configure Redis Distributed Cache with InMemory Fallback for Local/Test runs
        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (string.IsNullOrEmpty(redisConnectionString))
        {
            services.AddDistributedMemoryCache();
        }
        else
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
            });
        }

        services.AddScoped<ICacheService, CacheService>();

        // Configure Health Checks
        services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("Database")
            .AddCheck<RedisHealthCheck>("Redis")
            .AddCheck<StorageHealthCheck>("Storage")
            .AddCheck<AiProviderHealthCheck>("AI Provider");

        // Configure Quartz Background Processing
        services.AddQuartz(q =>
        {
            var outboxJobKey = new JobKey("ProcessOutboxJob");
            q.AddJob<ProcessOutboxJob>(opts => opts.WithIdentity(outboxJobKey));
            q.AddTrigger(opts => opts
                .ForJob(outboxJobKey)
                .WithIdentity("ProcessOutboxJob-trigger")
                .WithSimpleSchedule(x => x.WithIntervalInSeconds(5).RepeatForever()));

            var notifyJobKey = new JobKey("SendNotificationsJob");
            q.AddJob<SendNotificationsJob>(opts => opts.WithIdentity(notifyJobKey));
            q.AddTrigger(opts => opts
                .ForJob(notifyJobKey)
                .WithIdentity("SendNotificationsJob-trigger")
                .WithSimpleSchedule(x => x.WithIntervalInSeconds(5).RepeatForever()));
        });

        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        return services;
    }
}
