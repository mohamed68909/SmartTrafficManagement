using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IAuthRepository
{
    Task AddRefreshTokenAsync(RefreshToken token, CancellationToken cancellationToken = default);

    Task<RefreshToken?> GetActiveRefreshTokenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>Returns the existing default vehicle for the user, or null if none exists.</summary>
    Task<Vehicle?> GetDefaultVehicleAsync(string userId, CancellationToken cancellationToken = default);

    Task AddVehicleAsync(Vehicle vehicle, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
