using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IServiceRequestRepository
{
    Task<bool> HasActiveRequestAsync(string clientId, CancellationToken cancellationToken = default);

    Task AddAsync(ServiceRequest request, CancellationToken cancellationToken = default);

    Task<ServiceRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ServiceRequest?> GetByIdWithProviderAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceRequest>> GetPendingAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceRequest>> GetByClientAsync(string clientId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceRequest>> GetByProviderAsync(string providerId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceRequest>> GetRecentAsync(int limit, CancellationToken cancellationToken = default);

    Task<int> CountPendingAsync(CancellationToken cancellationToken = default);

    Task<int> CountCompletedByProviderAsync(string providerId, CancellationToken cancellationToken = default);

    /// <summary>Returns all Pending and Accepted SOS requests (urgent queue).</summary>
    Task<IReadOnlyList<ServiceRequest>> GetUrgentAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns a single request with Client, Provider, and Vehicle populated (for tracking).</summary>
    Task<ServiceRequest?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
