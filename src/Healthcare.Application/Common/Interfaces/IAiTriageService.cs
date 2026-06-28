using System.Threading;
using System.Threading.Tasks;

namespace Healthcare.Application.Common.Interfaces;

public record TriageAnalysis(string SeverityLevel, string Recommendation);

public interface IAiTriageService
{
    Task<TriageAnalysis> AssessSymptomsAsync(string description, CancellationToken cancellationToken = default);
}
