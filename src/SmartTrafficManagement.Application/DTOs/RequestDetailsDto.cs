using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs;

public sealed class RequestDetailsDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string? ProviderId { get; set; }
    public ServiceType ServiceType { get; set; }
    public RequestStatus Status { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public DateTime RequestedAtUtc { get; set; }
}
