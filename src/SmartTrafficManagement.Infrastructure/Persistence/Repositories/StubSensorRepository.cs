using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Stub implementation — returns empty until a real sensor table is added.
/// </summary>
public sealed class StubSensorRepository : ISensorRepository
{
    public Task<IReadOnlyList<SensorRow>> GetAllAsync(CancellationToken cancellationToken = default)
        => Task.FromResult<IReadOnlyList<SensorRow>>(Array.Empty<SensorRow>());
}
