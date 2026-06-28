using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Health;

public class RedisHealthCheck : IHealthCheck
{
    private readonly ICacheService _cacheService;

    public RedisHealthCheck(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var testKey = "healthcheck-ping";
            var testValue = "ok";

            await _cacheService.SetAsync(testKey, testValue, TimeSpan.FromSeconds(5), cancellationToken);
            var retrievedValue = await _cacheService.GetAsync<string>(testKey, cancellationToken);
            await _cacheService.RemoveAsync(testKey, cancellationToken);

            return testValue.Equals(retrievedValue, StringComparison.Ordinal)
                ? HealthCheckResult.Healthy("Cache/Redis service is healthy and functional.")
                : HealthCheckResult.Unhealthy("Cache/Redis service returned inconsistent data.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Cache/Redis health check threw an exception.", ex);
        }
    }
}
