using SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;

namespace SmartTrafficManagement.Infrastructure.Modules.Traffic.Infrastructure.Persistence.Repositories;

public sealed class TrafficModuleRepository : ITrafficModuleRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TrafficModuleRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<TrafficIncident>> GetActiveIncidentsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.TrafficIncidents
            .AsNoTracking()
            .Where(x => !x.IsResolved)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TrafficIncident>> GetIncidentsByLocationAsync(string location, CancellationToken cancellationToken = default)
    {
        return await _dbContext.TrafficIncidents
            .AsNoTracking()
            .Where(x => x.Location.Contains(location))
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
    }

    public async Task AddTrafficReportAsync(TrafficReport report, CancellationToken cancellationToken = default)
    {
        await _dbContext.TrafficReports.AddAsync(report, cancellationToken);
    }

    public async Task<SensorData?> GetLatestSensorDataByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SensorData
            .AsNoTracking()
            .Where(x => x.VehicleId == vehicleId)
            .OrderByDescending(x => x.CapturedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
