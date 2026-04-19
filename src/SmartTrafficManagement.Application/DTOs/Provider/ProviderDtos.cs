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

// ── Earnings ──
public sealed class ProviderEarningsDto
{
    public decimal Total     { get; set; }
    public decimal ThisMonth { get; set; }
    public decimal LastMonth { get; set; }
    public IReadOnlyList<ProviderEarningsDayDto> Weekly { get; set; } = [];
}

public sealed class ProviderEarningsDayDto
{
    public string  Day    { get; set; } = string.Empty; // e.g. "Mon"
    public decimal Amount { get; set; }
}

// ── Active Mission ──
public sealed class ProviderActiveMissionDto
{
    public Guid          RequestId   { get; set; }
    public ServiceType   ServiceType { get; set; }
    public RequestStatus Status      { get; set; }
    public decimal       Latitude    { get; set; }
    public decimal       Longitude   { get; set; }
    public string        ClientName  { get; set; } = string.Empty;
    public string        ClientPhone { get; set; } = string.Empty;
    public DateTime      RequestedAt { get; set; }
}

// ── Schedule ──
public sealed class ProviderScheduleDto
{
    public IReadOnlyList<string> WorkingDays { get; set; } = [];
    public int StartHour { get; set; }
    public int EndHour   { get; set; }
}

public sealed class UpdateProviderScheduleDto
{
    public List<string> WorkingDays { get; set; } = [];
    public int StartHour { get; set; }
    public int EndHour   { get; set; }
}

// ── Online status toggle ──
public sealed class ToggleProviderOnlineDto
{
    public bool Online { get; set; }
}

// ── Profile ──
public sealed class ProviderProfileDto
{
    public string  Name      { get; set; } = string.Empty;
    public string  Phone     { get; set; } = string.Empty;
    public string? Email     { get; set; }
    public double  Rating    { get; set; }
    public int     TotalJobs { get; set; }
    public bool    IsOnline  { get; set; }
}
