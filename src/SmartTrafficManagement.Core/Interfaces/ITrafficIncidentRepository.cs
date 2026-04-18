using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface ITrafficIncidentRepository
{
    Task<IReadOnlyList<TrafficIncident>> GetAllAsync(CancellationToken cancellationToken = default);
}
