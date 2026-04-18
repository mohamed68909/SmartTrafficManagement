using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IAuthRepository
{
    Task AddRefreshTokenAsync(RefreshToken token, CancellationToken cancellationToken = default);

    Task<RefreshToken?> GetActiveRefreshTokenAsync(string token, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
