using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Enums;

namespace Healthcare.Infrastructure.Services;

public class ModelManagementService : IModelManagementService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ModelManagementService> _logger;
    private readonly string _metadataPath;

    public ModelManagementService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<ModelManagementService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;

        var metadataPath = configuration["AiSettings:ModelMetadataPath"] ?? "src/Healthcare.Infrastructure/Ml/artifacts/model_metadata.json";
        _metadataPath = ResolvePath(metadataPath);
    }

    private string ResolvePath(string relativePath)
    {
        if (Path.IsPathRooted(relativePath)) return relativePath;
        var baseDir = AppContext.BaseDirectory;
        var path = Path.Combine(baseDir, relativePath);
        if (File.Exists(path)) return path;

        // Try stripping the project structure prefix for published deployments
        if (relativePath.StartsWith("src/Healthcare.Infrastructure/", StringComparison.OrdinalIgnoreCase))
        {
            var strippedPath = relativePath.Substring("src/Healthcare.Infrastructure/".Length);
            var publishedPath = Path.Combine(baseDir, strippedPath);
            if (File.Exists(publishedPath)) return publishedPath;
        }

        var currentDir = new DirectoryInfo(baseDir);
        while (currentDir != null)
        {
            var testPath = Path.Combine(currentDir.FullName, relativePath);
            if (File.Exists(testPath)) return testPath;
            currentDir = currentDir.Parent;
        }
        return relativePath;
    }

    private async Task SeedActiveModelAsync(IApplicationDbContext context, CancellationToken cancellationToken)
    {
        try
        {
            if (!File.Exists(_metadataPath)) return;

            var metadataJson = await File.ReadAllTextAsync(_metadataPath, cancellationToken);
            var meta = JsonSerializer.Deserialize<ModelMetadata>(metadataJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (meta == null) return;

            // Check if already seeded
            var exists = await context.ModelVersions.AnyAsync(m => m.Version == meta.Version && m.Name == meta.ModelName, cancellationToken);
            if (exists) return;

            // Seed training dataset
            var dataset = new TrainingDataset
            {
                Version = meta.DatasetVersion,
                Description = "Simulated patient symptom triage dataset used for initial training.",
                RowCount = 2500,
                FeaturesList = "fever,cough,shortness_of_breath,chest_pain,abdominal_pain,headache,fatigue,sore_throat,nausea,dizziness,age,gender,heart_rate,temperature",
                StoragePath = "src/Healthcare.Infrastructure/Ml/symptoms_triage_dataset.csv",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.TrainingDatasets.Add(dataset);

            var model = new ModelVersion
            {
                Name = meta.ModelName,
                Algorithm = meta.Algorithm,
                Version = meta.Version,
                Status = ModelStatus.Active,
                ArtifactPath = "src/Healthcare.Infrastructure/Ml/artifacts/triage_model.onnx",
                TrainingDataset = dataset,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.ModelVersions.Add(model);

            // Seed some performance metrics
            var metrics = new[]
            {
                new ModelPerformanceMetric { ModelVersion = model, MetricName = "Accuracy", Value = 0.82 },
                new ModelPerformanceMetric { ModelVersion = model, MetricName = "CriticalRecall", Value = 0.65 }
            };
            context.ModelPerformanceMetrics.AddRange(metrics);

            await context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Successfully seeded default active model: {ModelName}", meta.ModelName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed default active model.");
        }
    }

    public async Task<ModelVersion?> GetActiveModelAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var model = await context.ModelVersions
            .FirstOrDefaultAsync(m => m.IsActive && m.Status == ModelStatus.Active, cancellationToken);

        if (model == null)
        {
            await SeedActiveModelAsync(context, cancellationToken);
            model = await context.ModelVersions
                .FirstOrDefaultAsync(m => m.IsActive && m.Status == ModelStatus.Active, cancellationToken);
        }

        return model;
    }

    public async Task<ModelVersion?> GetShadowModelAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        return await context.ModelVersions
            .FirstOrDefaultAsync(m => m.IsActive && m.Status == ModelStatus.Shadow, cancellationToken);
    }

    public async Task RegisterModelAsync(ModelVersion model, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        context.ModelVersions.Add(model);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task PromoteToActiveAsync(Guid modelId, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var targetModel = await context.ModelVersions.FirstOrDefaultAsync(m => m.Id == modelId, cancellationToken);
        if (targetModel == null)
        {
            throw new InvalidOperationException($"Model version with ID {modelId} not found.");
        }

        // Deactivate old active models
        var activeModels = await context.ModelVersions
            .Where(m => m.Status == ModelStatus.Active)
            .ToListAsync(cancellationToken);

        foreach (var model in activeModels)
        {
            model.Status = ModelStatus.Retired;
            model.IsActive = false;
        }

        targetModel.Status = ModelStatus.Active;
        targetModel.IsActive = true;

        await context.SaveChangesAsync(cancellationToken);
    }
}
