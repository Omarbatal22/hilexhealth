using System.Threading;
using System.Threading.Tasks;
using Healthcare.Domain.Enums;

namespace Healthcare.Application.Common.Interfaces;

public record PredictionResult(UrgencyLevel UrgencyLevel, double Confidence, double[] Probabilities, string ModelVersion);

public interface IAiPredictionService
{
    Task<PredictionResult> PredictUrgencyAsync(
        string symptomDescription,
        double age,
        int gender,
        double heartRate,
        double temperature,
        string? modelVersion = null,
        CancellationToken cancellationToken = default);
}
