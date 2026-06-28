using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Health;

public class AiProviderHealthCheck : IHealthCheck
{
    private readonly IAiTriageService _aiTriageService;

    public AiProviderHealthCheck(IAiTriageService aiTriageService)
    {
        _aiTriageService = aiTriageService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var analysis = await _aiTriageService.AssessSymptomsAsync("Diagnostic health check system query.", cancellationToken);
            
            if (analysis == null || string.IsNullOrEmpty(analysis.SeverityLevel))
            {
                return HealthCheckResult.Unhealthy("AI Triage service returned an empty or invalid assessment.");
            }

            return HealthCheckResult.Healthy($"AI Provider is functional. Current status: active. Severity level returned: {analysis.SeverityLevel}");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("AI Provider health check threw an exception.", ex);
        }
    }
}
