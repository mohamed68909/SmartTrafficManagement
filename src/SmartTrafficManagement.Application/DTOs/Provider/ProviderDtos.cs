using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Provider;

public sealed class ProviderJobDto
{
    public Guid RequestId { get; set; }
    public ServiceType ServiceType { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class UpdateProviderRequestStatusDto
{
    public Guid RequestId { get; set; }
    public RequestStatus Status { get; set; }
}

public sealed class UpdateProviderLocationDto
{
    public Guid RequestId { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}

public sealed class ProviderDashboardDto
{
    public int TotalJobs { get; set; }
    public int CompletedJobs { get; set; }
    public int ActiveJobs { get; set; }
    public decimal TotalEarnings { get; set; }
}

public sealed class ProviderHistoryItemDto
{
    public Guid RequestId { get; set; }
    public ServiceType ServiceType { get; set; }
    public RequestStatus Status { get; set; }
    public decimal? EstimatedCost { get; set; }
    public DateTime RequestedAtUtc { get; set; }
}
