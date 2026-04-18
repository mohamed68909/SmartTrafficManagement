using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;

public interface ITrafficModuleRepository
{
    Task<IReadOnlyList<TrafficIncident>> GetActiveIncidentsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TrafficIncident>> GetIncidentsByLocationAsync(string location, CancellationToken cancellationToken = default);

    Task<ApplicationUser?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default);

    Task AddTrafficReportAsync(TrafficReport report, CancellationToken cancellationToken = default);

    Task<SensorData?> GetLatestSensorDataByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
