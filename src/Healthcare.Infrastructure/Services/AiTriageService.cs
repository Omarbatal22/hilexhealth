using System;
using System.Threading;
using System.Threading.Tasks;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Enums;

namespace Healthcare.Infrastructure.Services;

public class AiTriageService : IAiTriageService
{
    private readonly IAiPredictionService _aiPredictionService;

    public AiTriageService(IAiPredictionService aiPredictionService)
    {
        _aiPredictionService = aiPredictionService;
    }

    public async Task<TriageAnalysis> AssessSymptomsAsync(string description, CancellationToken cancellationToken = default)
    {
        // Call the prediction service with baseline patient vitals/demographics (Age 35, Male, 75 bpm, 37.0 C temperature)
        var result = await _aiPredictionService.PredictUrgencyAsync(
            description,
            age: 35.0,
            gender: 1,
            heartRate: 75.0,
            temperature: 37.0,
            modelVersion: null,
            cancellationToken: cancellationToken);

        var severity = result.UrgencyLevel.ToString();
        var recommendation = result.UrgencyLevel switch
        {
            UrgencyLevel.Critical => "CRITICAL ALERT: Medical emergency. Please head to the nearest Emergency Room or call emergency services immediately.",
            UrgencyLevel.High => "High Urgency: We recommend booking an urgent consultation with a specialist immediately.",
            UrgencyLevel.Medium => "Medium Urgency: Please book a routine appointment with a doctor within the next 24-48 hours.",
            UrgencyLevel.Low => "Low Urgency: Mild symptoms detected. Self-care, rest, and hydration are recommended. Consult a doctor if symptoms persist.",
            _ => "Mild symptoms detected. Monitor your status."
        };

        return new TriageAnalysis(severity, recommendation);
    }
}
