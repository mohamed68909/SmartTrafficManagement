namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class TrafficIntelligenceRepository : ITrafficIntelligenceRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TrafficIntelligenceRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
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
