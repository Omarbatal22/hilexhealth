using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Auth.Commands.Logout;

public record LogoutCommand : IRequest
{
    public string RefreshToken { get; init; } = null!;
}

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IApplicationDbContext _context;

    public LogoutCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var tokenRecord = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

        if (tokenRecord != null)
        {
            tokenRecord.IsRevoked = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
