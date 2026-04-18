namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class ServiceRequestRepository : IServiceRequestRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ServiceRequestRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> HasActiveRequestAsync(string clientId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests.AnyAsync(
            x => x.ClientId == clientId
                 && (x.Status == RequestStatus.Pending || x.Status == RequestStatus.Accepted || x.Status == RequestStatus.InProgress),
            cancellationToken);
    }

    public async Task AddAsync(ServiceRequest request, CancellationToken cancellationToken = default)
    {
        await _dbContext.ServiceRequests.AddAsync(request, cancellationToken);
    }

    public async Task<ServiceRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceRequest?> GetByIdWithProviderAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests
            .Include(x => x.Provider)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceRequest>> GetPendingAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests
            .AsNoTracking()
            .Where(x => x.Status == RequestStatus.Pending)
            .OrderByDescending(x => x.RequestedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceRequest>> GetByClientAsync(string clientId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests
            .AsNoTracking()
            .Where(x => x.ClientId == clientId)
            .OrderByDescending(x => x.RequestedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceRequest>> GetByProviderAsync(string providerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests
            .AsNoTracking()
            .Where(x => x.ProviderId == providerId)
            .OrderByDescending(x => x.RequestedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceRequest>> GetRecentAsync(int limit, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests
            .AsNoTracking()
            .Include(x => x.Client)
            .Include(x => x.Provider)
            .OrderByDescending(x => x.RequestedAtUtc)
            .Take(limit <= 0 ? 20 : limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountPendingAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ServiceRequests.CountAsync(x => x.Status == RequestStatus.Pending, cancellationToken);
    }

    public async Task<int> CountCompletedByProviderAsync(string providerId, CancellationToken cancellationToken = default)
        => await _dbContext.ServiceRequests
            .CountAsync(r => r.ProviderId == providerId
                          && r.Status == RequestStatus.Completed,
                        cancellationToken);

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
