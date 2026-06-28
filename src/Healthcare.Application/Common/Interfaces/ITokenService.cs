using System;
using System.Threading.Tasks;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    Task<string> GenerateRefreshTokenAsync(User user, string ipAddress, string userAgent);
}
