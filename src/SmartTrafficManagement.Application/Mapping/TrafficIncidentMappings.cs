using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Application.Mapping;

public static class TrafficIncidentMappings
{
    public static TrafficIncidentDto ToDto(this TrafficIncident incident)
        => new(
            incident.Id,
            incident.Title,
            incident.Location,
            incident.Severity,
            incident.IsResolved);
}
