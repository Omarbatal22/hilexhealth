using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Health;

public class DatabaseHealthCheck : IHealthCheck
{
    private readonly IApplicationDbContext _context;

    public DatabaseHealthCheck(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _context.CanConnectAsync(cancellationToken);
            return canConnect 
                ? HealthCheckResult.Healthy("Database is healthy and reachable.")
                : HealthCheckResult.Unhealthy("Database connection test failed.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database health check threw an exception.", ex);
        }
    }
}
