using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Features.Triage.Commands.SubmitTriageAssessment;
using Healthcare.Application.Features.Triage.Queries.GetTriageAssessment;
using Healthcare.Application.Features.Triage.Queries.ListTriageAssessments;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Enums;
using Healthcare.Domain.Events;
using Healthcare.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Healthcare.Persistence;

namespace Healthcare.Tests;

public class AiTriageTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IDateTimeProvider> _mockDateTime;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly SymptomExtractionService _symptomExtractor;
    private readonly AiPredictionService _predictionService;
    private readonly ModelManagementService _modelManager;
    private readonly PredictionLoggingService _predictionLogger;

    public AiTriageTests()
    {
        // 1. Setup DbContext
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        // 2. Setup services
        _mockDateTime = new Mock<IDateTimeProvider>();
        _mockDateTime.Setup(d => d.UtcNow).Returns(new DateTime(2026, 6, 17, 12, 0, 0, DateTimeKind.Utc));

        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockCurrentUserService.Setup(u => u.UserId).Returns(Guid.NewGuid());

        _mockConfiguration = new Mock<IConfiguration>();

        // Set paths to artifact folder relative to solution root or test run path
        // During tests, current directory is Healthcare.Tests/bin/Debug/net9.0
        var baseDir = AppContext.BaseDirectory;
        var solutionRoot = FindSolutionRoot(baseDir);

        var onnxPath = Path.Combine(solutionRoot, "src", "Healthcare.Infrastructure", "Ml", "artifacts", "triage_model.onnx");
        var scalerPath = Path.Combine(solutionRoot, "src", "Healthcare.Infrastructure", "Ml", "artifacts", "scaler_params.json");
        var metadataPath = Path.Combine(solutionRoot, "src", "Healthcare.Infrastructure", "Ml", "artifacts", "model_metadata.json");

        _mockConfiguration.Setup(c => c["AiSettings:ModelPath"]).Returns(onnxPath);
        _mockConfiguration.Setup(c => c["AiSettings:ScalerPath"]).Returns(scalerPath);
        _mockConfiguration.Setup(c => c["AiSettings:ModelMetadataPath"]).Returns(metadataPath);

        _symptomExtractor = new SymptomExtractionService();
        
        var loggerPredict = new Mock<ILogger<AiPredictionService>>();
        _predictionService = new AiPredictionService(_symptomExtractor, _mockConfiguration.Object, loggerPredict.Object);

        // Build a real ServiceProvider for singleton services to resolve IApplicationDbContext inside scope correctly
        var services = new ServiceCollection();
        services.AddSingleton<IApplicationDbContext>(_context);
        var serviceProvider = services.BuildServiceProvider();

        var loggerModel = new Mock<ILogger<ModelManagementService>>();
        _modelManager = new ModelManagementService(serviceProvider, _mockConfiguration.Object, loggerModel.Object);
        
        var loggerPredictLog = new Mock<ILogger<PredictionLoggingService>>();
        _predictionLogger = new PredictionLoggingService(serviceProvider, loggerPredictLog.Object);
    }

    private string FindSolutionRoot(string baseDir)
    {
        var currentDir = new DirectoryInfo(baseDir);
        while (currentDir != null)
        {
            if (currentDir.GetFiles("Healthcare.sln").Any())
            {
                return currentDir.FullName;
            }
            currentDir = currentDir.Parent;
        }
        return baseDir;
    }

    [Fact]
    public async Task ExtractSymptoms_Bilingual_IdentifiesCorrectKeywords()
    {
        // Act: English symptoms
        var englishResult = await _symptomExtractor.ExtractSymptomsAsync("I have a severe cough, a bad headache, and felt dizzy.");
        var englishSymptoms = englishResult.Select(s => s.NormalizedText).ToList();

        // Act: Arabic symptoms
        var arabicResult = await _symptomExtractor.ExtractSymptomsAsync("أعاني من كحة شديدة وصداع وألم في صدري");
        var arabicSymptoms = arabicResult.Select(s => s.NormalizedText).ToList();

        // Assert English
        Assert.Contains("cough", englishSymptoms);
        Assert.Contains("headache", englishSymptoms);
        Assert.Contains("dizziness", englishSymptoms);

        // Assert Arabic
        Assert.Contains("cough", arabicSymptoms);
        Assert.Contains("headache", arabicSymptoms);
        Assert.Contains("chest_pain", arabicSymptoms);
    }

    [Fact]
    public async Task PredictUrgency_CriticalVsLow_ClassifiesCorrectly()
    {
        // Act: Critical symptoms (Chest Pain, Shortness of breath, high heart rate, older patient)
        var criticalResult = await _predictionService.PredictUrgencyAsync(
            symptomDescription: "I have terrible chest pain and extreme shortness of breath. My heart is beating very fast.",
            age: 72.0,
            gender: 1,
            heartRate: 125.0,
            temperature: 38.5
        );

        // Act: Low urgency symptoms (Fatigue, slight headache, normal vitals, young patient)
        var lowResult = await _predictionService.PredictUrgencyAsync(
            symptomDescription: "I feel a bit tired today. No other symptoms.",
            age: 24.0,
            gender: 0,
            heartRate: 70.0,
            temperature: 36.8
        );

        // Assert
        Assert.Equal(UrgencyLevel.Critical, criticalResult.UrgencyLevel);
        Assert.True(criticalResult.Confidence > 0.0);

        Assert.Equal(UrgencyLevel.Low, lowResult.UrgencyLevel);
        Assert.True(lowResult.Confidence > 0.0);
    }

    [Fact]
    public async Task SubmitTriageAssessmentCommand_ValidRequest_PersistsAndLogsAndEscalates()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, UserName = "john.doe@test.com", Email = "john.doe@test.com", Role = "Patient", PasswordHash = "hash" };
        _context.Users.Add(user);

        var patient = new Patient
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FirstName = "John",
            LastName = "Doe",
            DateOfBirth = new DateTime(1980, 5, 10),
            BiologicalSex = "Male",
            PhoneNumber = "1234567890",
            EmergencyContactName = "Jane Doe",
            EmergencyContactPhone = "9876543210"
        };
        _context.Patients.Add(patient);

        var doctorUserId = Guid.NewGuid();
        var doctorUser = new User { Id = doctorUserId, UserName = "alice.smith@test.com", Email = "alice.smith@test.com", Role = "Doctor", PasswordHash = "hash" };
        _context.Users.Add(doctorUser);

        var doctor = new Doctor
        {
            Id = Guid.NewGuid(),
            UserId = doctorUserId,
            FirstName = "Alice",
            LastName = "Smith",
            Specialty = "Cardiology",
            PhoneNumber = "9876543210",
            LicenseNumber = "LIC-12345",
            IsVerified = true
        };
        _context.Doctors.Add(doctor);

        await _context.SaveChangesAsync();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId);

        var command = new SubmitTriageAssessmentCommand
        {
            PatientId = patient.Id,
            SymptomDescription = "I am experiencing squeezing chest pain and breathing problems.",
            HeartRate = 110.0,
            Temperature = 38.0
        };

        var handler = new SubmitTriageAssessmentCommandHandler(
            _context,
            _predictionService,
            _symptomExtractor,
            _modelManager,
            _predictionLogger,
            _mockDateTime.Object,
            _mockCurrentUserService.Object
        );

        // Act
        var assessmentId = await handler.Handle(command, CancellationToken.None);

        // Assert: Check triage assessment saved
        var assessment = await _context.TriageAssessments
            .FirstOrDefaultAsync(a => a.Id == assessmentId);

        Assert.NotNull(assessment);
        Assert.Equal(patient.Id, assessment.PatientId);
        Assert.True(assessment.UrgencyLevel == UrgencyLevel.High || assessment.UrgencyLevel == UrgencyLevel.Critical);
        Assert.True(assessment.IsEscalated);

        // Assert: TriageAssessmentCreatedEvent is raised
        Assert.Single(assessment.DomainEvents);
        Assert.IsType<TriageAssessmentCreatedEvent>(assessment.DomainEvents.First());

        // Assert: Primary prediction was registered
        var predictions = await _context.TriagePredictions
            .Where(p => p.TriageAssessmentId == assessmentId)
            .ToListAsync();
        Assert.NotEmpty(predictions);
        Assert.Equal(PredictionSource.Primary, predictions.First().PredictionSource);

        // Assert: Inference log was recorded
        var logs = await _context.AiPredictionLogs.ToListAsync();
        Assert.Single(logs);
        Assert.Equal(userId, logs.First().UserId);
        Assert.True(logs.First().UrgencyLevel == UrgencyLevel.High || logs.First().UrgencyLevel == UrgencyLevel.Critical);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        _predictionService?.Dispose();
    }
}
