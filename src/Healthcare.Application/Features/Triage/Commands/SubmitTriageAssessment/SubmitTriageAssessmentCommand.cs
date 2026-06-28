using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Enums;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Triage.Commands.SubmitTriageAssessment;

public record SubmitTriageAssessmentCommand : IRequest<Guid>
{
    public Guid PatientId { get; init; }
    public string SymptomDescription { get; init; } = null!;
    public double HeartRate { get; init; } = 75.0; // Default normal vitals
    public double Temperature { get; init; } = 37.0; // Default normal vitals
}

public class SubmitTriageAssessmentCommandValidator : AbstractValidator<SubmitTriageAssessmentCommand>
{
    public SubmitTriageAssessmentCommandValidator()
    {
        RuleFor(x => x.SymptomDescription).NotEmpty().MaximumLength(1500);
        RuleFor(x => x.HeartRate).InclusiveBetween(30.0, 250.0).WithMessage("Heart rate must be between 30 and 250 bpm.");
        RuleFor(x => x.Temperature).InclusiveBetween(30.0, 45.0).WithMessage("Temperature must be between 30 and 45 Celsius.");
    }
}

public class SubmitTriageAssessmentCommandHandler : IRequestHandler<SubmitTriageAssessmentCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IAiPredictionService _aiPredictionService;
    private readonly ISymptomExtractionService _symptomExtractor;
    private readonly IModelManagementService _modelManager;
    private readonly IPredictionLoggingService _predictionLogger;
    private readonly IDateTimeProvider _dateTime;
    private readonly ICurrentUserService _currentUserService;

    public SubmitTriageAssessmentCommandHandler(
        IApplicationDbContext context,
        IAiPredictionService aiPredictionService,
        ISymptomExtractionService symptomExtractor,
        IModelManagementService modelManager,
        IPredictionLoggingService predictionLogger,
        IDateTimeProvider dateTime,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _aiPredictionService = aiPredictionService;
        _symptomExtractor = symptomExtractor;
        _modelManager = modelManager;
        _predictionLogger = predictionLogger;
        _dateTime = dateTime;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(SubmitTriageAssessmentCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch Patient details
        Patient? patient = null;
        if (request.PatientId == Guid.Empty)
        {
            var userId = _currentUserService.UserId;
            if (userId.HasValue)
            {
                patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.UserId == userId.Value, cancellationToken);
            }
            if (patient == null)
            {
                throw new NotFoundException(nameof(Patient), userId.HasValue ? userId.Value.ToString() : "unknown");
            }
        }
        else
        {
            patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);
            if (patient == null)
            {
                throw new NotFoundException(nameof(Patient), request.PatientId);
            }
        }

        // Calculate age
        var today = _dateTime.UtcNow.Date;
        var age = today.Year - patient.DateOfBirth.Year;
        if (patient.DateOfBirth.Date > today.AddYears(-age)) age--;

        // Map biological sex to numeric gender feature (Male = 1.0, Female = 0.0)
        var genderFeature = string.Equals(patient.BiologicalSex, "Male", StringComparison.OrdinalIgnoreCase) ? 1 : 0;

        // 2. Perform NLP Symptom Keyword Extraction (Bilingual)
        var extractedSymptoms = await _symptomExtractor.ExtractSymptomsAsync(request.SymptomDescription, cancellationToken);
        var symptomNames = extractedSymptoms.Select(s => s.NormalizedText).Distinct().ToList();
        var extractedJson = JsonSerializer.Serialize(symptomNames);

        // 3. Get Active Model Version
        var activeModel = await _modelManager.GetActiveModelAsync(cancellationToken);
        var modelVersionName = activeModel?.Name ?? "triage_random_forest_v1.0";
        var modelVersionId = activeModel?.Id;

        // 4. Execute Inference via IAiPredictionService (Primary Model)
        var startTime = _dateTime.UtcNow;
        var predictionResult = await _aiPredictionService.PredictUrgencyAsync(
            request.SymptomDescription,
            age,
            genderFeature,
            request.HeartRate,
            request.Temperature,
            modelVersionName,
            cancellationToken);
        var executionTimeMs = (long)(_dateTime.UtcNow - startTime).TotalMilliseconds;

        // Formulate Recommendations
        var recommendation = predictionResult.UrgencyLevel switch
        {
            UrgencyLevel.Critical => "CRITICAL MEDICAL ALERT: Immediate emergency room evaluation recommended. Call emergency services now.",
            UrgencyLevel.High => "High Urgency: We strongly recommend booking an immediate urgent consultation with a specialist.",
            UrgencyLevel.Medium => "Medium Urgency: We recommend booking a routine consultation with a medical professional within the next 24 hours.",
            UrgencyLevel.Low => "Low Urgency: Symptoms appear mild. Rest, hydrate, and monitor your condition. Book a checkup if symptoms persist.",
            _ => "Symptom assessment complete. Please monitor your health and consult a physician."
        };

        // 5. Store TriageAssessment record
        var assessment = new TriageAssessment
        {
            PatientId = patient.Id,
            SymptomDescription = request.SymptomDescription,
            ExtractedSymptoms = extractedJson,
            UrgencyLevel = predictionResult.UrgencyLevel,
            Recommendation = recommendation,
            Confidence = predictionResult.Confidence,
            ModelVersionId = modelVersionId,
            IsEscalated = predictionResult.UrgencyLevel == UrgencyLevel.High || predictionResult.UrgencyLevel == UrgencyLevel.Critical,
            CreatedAt = _dateTime.UtcNow
        };

        _context.TriageAssessments.Add(assessment);

        // 6. Primary Prediction Registry entry
        var primaryPrediction = new TriagePrediction
        {
            TriageAssessment = assessment,
            ModelVersionId = modelVersionId ?? Guid.Empty,
            UrgencyLevel = predictionResult.UrgencyLevel,
            Confidence = predictionResult.Confidence,
            PredictionSource = PredictionSource.Primary,
            CreatedAt = _dateTime.UtcNow
        };
        _context.TriagePredictions.Add(primaryPrediction);

        // 7. Check for Shadow Model & execute side-by-side inference (Shadow Testing)
        var shadowModel = await _modelManager.GetShadowModelAsync(cancellationToken);
        if (shadowModel != null)
        {
            try
            {
                var shadowResult = await _aiPredictionService.PredictUrgencyAsync(
                    request.SymptomDescription,
                    age,
                    genderFeature,
                    request.HeartRate,
                    request.Temperature,
                    shadowModel.Name,
                    cancellationToken);

                var shadowPrediction = new TriagePrediction
                {
                    TriageAssessment = assessment,
                    ModelVersionId = shadowModel.Id,
                    UrgencyLevel = shadowResult.UrgencyLevel,
                    Confidence = shadowResult.Confidence,
                    PredictionSource = PredictionSource.Shadow,
                    CreatedAt = _dateTime.UtcNow
                };
                _context.TriagePredictions.Add(shadowPrediction);
            }
            catch (Exception ex)
            {
                // Shadow model failure should never impact the patient's primary flow
                // Log and continue
                System.Diagnostics.Debug.WriteLine($"Shadow model execution failed: {ex.Message}");
            }
        }

        // 8. Log the Inference Event in AiPredictionLog
        var featureMap = new Dictionary<string, object>
        {
            { "age", age },
            { "gender", genderFeature },
            { "heart_rate", request.HeartRate },
            { "temperature", request.Temperature },
            { "symptoms", symptomNames }
        };
        var featuresJson = JsonSerializer.Serialize(featureMap);
        var probabilitiesJson = JsonSerializer.Serialize(predictionResult.Probabilities);

        var predictionLog = new AiPredictionLog
        {
            UserId = patient.UserId,
            CorrelationId = Guid.NewGuid().ToString(),
            ModelVersionName = modelVersionName,
            FeaturesJson = featuresJson,
            OutputProbabilitiesJson = probabilitiesJson,
            UrgencyLevel = predictionResult.UrgencyLevel,
            Confidence = predictionResult.Confidence,
            ExecutionTimeMs = executionTimeMs,
            Timestamp = _dateTime.UtcNow
        };
        
        await _predictionLogger.LogPredictionAsync(predictionLog, cancellationToken);

        // 9. Dispatch Doctor Escalation Event if high/critical severity
        if (assessment.IsEscalated)
        {
            assessment.AddDomainEvent(new TriageAssessmentCreatedEvent(assessment));
        }

        await _context.SaveChangesAsync(cancellationToken);

        return assessment.Id;
    }
}
