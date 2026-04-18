using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class TrafficIncident : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public IncidentSeverity Severity { get; set; }

    public bool IsResolved { get; set; }
}
