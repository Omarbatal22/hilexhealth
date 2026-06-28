using System.Threading;
using System.Threading.Tasks;

namespace Healthcare.Application.Common.Interfaces;

public interface ISmsService
{
    Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
}
