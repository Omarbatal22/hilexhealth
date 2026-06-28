using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Common.Behaviors;

public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public TransactionBehavior(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Only wrap commands in transactions
        if (!request.GetType().Name.EndsWith("Command"))
        {
            return await next();
        }

        if (_dbContext is DbContext efDbContext)
        {
            if (efDbContext.Database.CurrentTransaction != null)
            {
                return await next();
            }

            var strategy = efDbContext.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await efDbContext.Database.BeginTransactionAsync(cancellationToken);
                try
                {
                    var response = await next();
                    await transaction.CommitAsync(cancellationToken);
                    return response;
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    throw;
                }
            });
        }

        return await next();
    }
}
