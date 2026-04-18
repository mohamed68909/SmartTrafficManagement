using SmartTrafficManagement.Core.Modules.Garage.Domain.Interfaces;

namespace SmartTrafficManagement.Infrastructure.Modules.Garage.Infrastructure.Persistence.Repositories;

public sealed class GarageRepository : IGarageRepository
{
    private readonly ApplicationDbContext _dbContext;

    public GarageRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Vehicle>> GetByOwnerAsync(string ownerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Vehicles
            .AsNoTracking()
            .Where(v => v.OwnerId == ownerId && !v.IsDeleted)
            .OrderByDescending(v => v.IsDefault)
            .ThenByDescending(v => v.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Vehicles.FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task AddAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        await _dbContext.Vehicles.AddAsync(vehicle, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
