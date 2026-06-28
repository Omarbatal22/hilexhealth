using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Healthcare.Application.Common.Interfaces;

public record ExtractedSymptom(string RawText, string NormalizedText, string Language);

public interface ISymptomExtractionService
{
    Task<IReadOnlyList<ExtractedSymptom>> ExtractSymptomsAsync(string text, CancellationToken cancellationToken = default);
}
