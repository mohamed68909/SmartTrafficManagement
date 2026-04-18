using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs;

public sealed record TrafficIncidentDto(
    Guid Id,
    string Title,
    string Location,
    IncidentSeverity Severity,
    bool IsResolved);
