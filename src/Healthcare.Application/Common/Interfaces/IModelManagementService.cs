using System;
using System.Threading;
using System.Threading.Tasks;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Common.Interfaces;

public interface IModelManagementService
{
    Task<ModelVersion?> GetActiveModelAsync(CancellationToken cancellationToken = default);
    Task<ModelVersion?> GetShadowModelAsync(CancellationToken cancellationToken = default);
    Task RegisterModelAsync(ModelVersion model, CancellationToken cancellationToken = default);
    Task PromoteToActiveAsync(Guid modelId, CancellationToken cancellationToken = default);
}
