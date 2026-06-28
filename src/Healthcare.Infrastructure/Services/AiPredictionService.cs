using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Enums;

namespace Healthcare.Infrastructure.Services;

public class ScalerParams
{
    public List<double> Mean { get; set; } = new();
    public List<double> Scale { get; set; } = new();
    public List<string> Columns { get; set; } = new();
}

public class ModelMetadata
{
    public string ModelName { get; set; } = null!;
    public string Algorithm { get; set; } = null!;
    public string Version { get; set; } = null!;
    public string TrainingDate { get; set; } = null!;
    public string DatasetVersion { get; set; } = null!;
}

public class AiPredictionService : IAiPredictionService, IDisposable
{
    private readonly ISymptomExtractionService _symptomExtractor;
    private readonly ILogger<AiPredictionService> _logger;
    private readonly InferenceSession _inferenceSession;
    private readonly ScalerParams _scalerParams;
    private readonly ModelMetadata _modelMetadata;

    public AiPredictionService(
        ISymptomExtractionService symptomExtractor,
        IConfiguration configuration,
        ILogger<AiPredictionService> _logger)
    {
        _symptomExtractor = symptomExtractor;
        this._logger = _logger;

        var modelPath = configuration["AiSettings:ModelPath"] ?? "src/Healthcare.Infrastructure/Ml/artifacts/triage_model.onnx";
        var scalerPath = configuration["AiSettings:ScalerPath"] ?? "src/Healthcare.Infrastructure/Ml/artifacts/scaler_params.json";
        var metadataPath = configuration["AiSettings:ModelMetadataPath"] ?? "src/Healthcare.Infrastructure/Ml/artifacts/model_metadata.json";

        // Resolve paths resiliently
        modelPath = ResolvePath(modelPath);
        scalerPath = ResolvePath(scalerPath);
        metadataPath = ResolvePath(metadataPath);

        _logger.LogInformation("Loading ONNX Model from: {Path}", modelPath);
        _logger.LogInformation("Loading Scaler Parameters from: {Path}", scalerPath);

        try
        {
            _inferenceSession = new InferenceSession(modelPath);

            var scalerJson = File.ReadAllText(scalerPath);
            _scalerParams = JsonSerializer.Deserialize<ScalerParams>(scalerJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                            ?? throw new InvalidOperationException("Failed to deserialize scaler params.");

            var metadataJson = File.ReadAllText(metadataPath);
            _modelMetadata = JsonSerializer.Deserialize<ModelMetadata>(metadataJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                             ?? throw new InvalidOperationException("Failed to deserialize model metadata.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize AI prediction service. Running in fallback mode.");
            throw;
        }
    }

    private string ResolvePath(string relativePath)
    {
        if (Path.IsPathRooted(relativePath))
        {
            return relativePath;
        }

        // Try AppContext Base Directory
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

        // Try matching solution directory up the tree
        var currentDir = new DirectoryInfo(baseDir);
        while (currentDir != null)
        {
            var testPath = Path.Combine(currentDir.FullName, relativePath);
            if (File.Exists(testPath)) return testPath;
            currentDir = currentDir.Parent;
        }

        // Return original
        return relativePath;
    }

    public async Task<PredictionResult> PredictUrgencyAsync(
        string symptomDescription,
        double age,
        int gender,
        double heartRate,
        double temperature,
        string? modelVersion = null,
        CancellationToken cancellationToken = default)
    {
        // 1. Extract symptoms
        var extracted = await _symptomExtractor.ExtractSymptomsAsync(symptomDescription, cancellationToken);
        var symptomMap = extracted.Select(s => s.NormalizedText).ToHashSet();

        // Features list order:
        // fever, cough, shortness_of_breath, chest_pain, abdominal_pain, headache, fatigue, sore_throat, nausea, dizziness, age, gender, heart_rate, temperature
        var featureVector = new float[14];
        featureVector[0] = symptomMap.Contains("fever") ? 1.0f : 0.0f;
        featureVector[1] = symptomMap.Contains("cough") ? 1.0f : 0.0f;
        featureVector[2] = symptomMap.Contains("shortness_of_breath") ? 1.0f : 0.0f;
        featureVector[3] = symptomMap.Contains("chest_pain") ? 1.0f : 0.0f;
        featureVector[4] = symptomMap.Contains("abdominal_pain") ? 1.0f : 0.0f;
        featureVector[5] = symptomMap.Contains("headache") ? 1.0f : 0.0f;
        featureVector[6] = symptomMap.Contains("fatigue") ? 1.0f : 0.0f;
        featureVector[7] = symptomMap.Contains("sore_throat") ? 1.0f : 0.0f;
        featureVector[8] = symptomMap.Contains("nausea") ? 1.0f : 0.0f;
        featureVector[9] = symptomMap.Contains("dizziness") ? 1.0f : 0.0f;

        // 2. Scale continuous inputs
        // scaler_params: mean & scale for [age, heart_rate, temperature]
        featureVector[10] = (float)((age - _scalerParams.Mean[0]) / _scalerParams.Scale[0]);
        featureVector[11] = gender; // 1 for Male, 0 for Female
        featureVector[12] = (float)((heartRate - _scalerParams.Mean[1]) / _scalerParams.Scale[1]);
        featureVector[13] = (float)((temperature - _scalerParams.Mean[2]) / _scalerParams.Scale[2]);

        // 3. Inference
        var inputName = _inferenceSession.InputMetadata.Keys.First();
        var tensor = new DenseTensor<float>(featureVector, new[] { 1, 14 });
        var inputs = new List<NamedOnnxValue> { NamedOnnxValue.CreateFromTensor(inputName, tensor) };

        using var results = _inferenceSession.Run(inputs);

        // Retrieve labels and probabilities
        // Output 1 is label tensor, Output 2 is probabilities tensor
        var labelOutput = results.FirstOrDefault(r => r.Name.Contains("label", StringComparison.OrdinalIgnoreCase)) ?? results.ElementAt(0);
        var probabilitiesOutput = results.FirstOrDefault(r => r.Name.Contains("prob", StringComparison.OrdinalIgnoreCase)) ?? results.ElementAt(1);

        var labelData = labelOutput.AsTensor<long>();
        var predictedLabel = (int)labelData.First();

        var probabilities = new double[4];

        // 4. Handle both ZipMap (Sequence of maps) and flat float/double Tensors
        if (probabilitiesOutput.Value is System.Collections.IEnumerable enumerable && !(probabilitiesOutput.Value is Tensor<float> || probabilitiesOutput.Value is Tensor<double>))
        {
            foreach (var item in enumerable)
            {
                object? innerVal = null;
                if (item is NamedOnnxValue namedVal)
                {
                    innerVal = namedVal.Value;
                }
                else
                {
                    var prop = item?.GetType().GetProperty("Value");
                    if (prop != null)
                    {
                        innerVal = prop.GetValue(item);
                    }
                }

                if (innerVal is IDictionary<long, float> dictLong)
                {
                    for (int i = 0; i < 4; i++)
                    {
                        if (dictLong.TryGetValue(i, out var val))
                            probabilities[i] = val;
                    }
                    break;
                }
                else if (innerVal is IDictionary<string, float> dictString)
                {
                    for (int i = 0; i < 4; i++)
                    {
                        if (dictString.TryGetValue(i.ToString(), out var val))
                            probabilities[i] = val;
                    }
                    break;
                }
            }
        }
        else
        {
            var probData = probabilitiesOutput.AsTensor<float>();
            if (probData != null)
            {
                for (int i = 0; i < Math.Min(4, probData.Length); i++)
                {
                    probabilities[i] = probData.ElementAt(i);
                }
            }
            else
            {
                var probDataDouble = probabilitiesOutput.AsTensor<double>();
                if (probDataDouble != null)
                {
                    for (int i = 0; i < Math.Min(4, probDataDouble.Length); i++)
                    {
                        probabilities[i] = probDataDouble.ElementAt(i);
                    }
                }
            }
        }

        var urgency = predictedLabel switch
        {
            0 => UrgencyLevel.Low,
            1 => UrgencyLevel.Medium,
            2 => UrgencyLevel.High,
            3 => UrgencyLevel.Critical,
            _ => UrgencyLevel.Low
        };

        var confidence = probabilities[predictedLabel];

        return new PredictionResult(
            urgency,
            confidence,
            probabilities,
            _modelMetadata.ModelName
        );
    }

    public void Dispose()
    {
        _inferenceSession?.Dispose();
    }
}
