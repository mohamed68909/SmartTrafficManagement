namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class TrafficIncidentRepository : ITrafficIncidentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TrafficIncidentRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<TrafficIncident>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.TrafficIncidents
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }
}
