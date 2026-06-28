using System.Threading;
using System.Threading.Tasks;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Common.Interfaces;

public interface IPredictionLoggingService
{
    Task LogPredictionAsync(AiPredictionLog log, CancellationToken cancellationToken = default);
}
