using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Modules.Garage.Domain.Interfaces;

public interface IGarageRepository
{
    Task<IReadOnlyList<Vehicle>> GetByOwnerAsync(string ownerId, CancellationToken cancellationToken = default);

    Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Vehicle vehicle, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
