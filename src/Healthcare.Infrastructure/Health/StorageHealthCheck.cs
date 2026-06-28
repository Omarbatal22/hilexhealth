using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Healthcare.Infrastructure.Health;

public class StorageHealthCheck : IHealthCheck
{
    private readonly IConfiguration _configuration;

    public StorageHealthCheck(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var tempDirectory = _configuration["StorageSettings:TempPath"];
            if (string.IsNullOrEmpty(tempDirectory))
            {
                tempDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads_temp");
            }

            if (!Directory.Exists(tempDirectory))
            {
                Directory.CreateDirectory(tempDirectory);
            }

            var tempFilePath = Path.Combine(tempDirectory, $"{Guid.NewGuid()}.txt");
            
            // Test Write
            File.WriteAllText(tempFilePath, "HealthCheck");
            
            // Test Read
            var readContent = File.ReadAllText(tempFilePath);
            if (readContent != "HealthCheck")
            {
                return Task.FromResult(HealthCheckResult.Unhealthy("Storage write/read verification failed."));
            }

            // Test Delete
            File.Delete(tempFilePath);

            return Task.FromResult(HealthCheckResult.Healthy("Storage path is writable and readable."));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy($"Storage health check threw an exception. Path tried: {_configuration["StorageSettings:TempPath"] ?? "Default BaseDirectory/uploads_temp"}", ex));
        }
    }
}
