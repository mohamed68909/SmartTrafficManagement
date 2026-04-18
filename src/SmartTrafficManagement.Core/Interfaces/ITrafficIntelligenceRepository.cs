using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface ITrafficIntelligenceRepository
{
    Task<ApplicationUser?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default);

    Task AddTrafficReportAsync(TrafficReport report, CancellationToken cancellationToken = default);

    Task<SensorData?> GetLatestSensorDataByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
