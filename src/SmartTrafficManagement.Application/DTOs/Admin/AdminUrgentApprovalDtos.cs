using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Admin;

// ── Urgent / SOS ─────────────────────────────────────────────────────────────

public sealed class AdminUrgentSosDto
{
    public Guid          RequestId    { get; set; }
    public string        ClientName   { get; set; } = string.Empty;
    public string        ClientPhone  { get; set; } = string.Empty;
    public ServiceType   ServiceType  { get; set; }
    public RequestStatus Status       { get; set; }
    public decimal       Latitude     { get; set; }
    public decimal       Longitude    { get; set; }
    public string?       ProviderName { get; set; }
    public DateTime      RequestedAt  { get; set; }
}

public sealed class AssignSosDto
{
    public string  ProviderId { get; set; } = string.Empty;
    public string? Note       { get; set; }
}

public sealed class AdminSosTrackDto
{
    public Guid          RequestId      { get; set; }
    public RequestStatus Status         { get; set; }
    public string        ClientName     { get; set; } = string.Empty;
    public string?       ProviderName   { get; set; }
    public decimal       ClientLat      { get; set; }
    public decimal       ClientLng      { get; set; }
    public decimal?      ProviderLat    { get; set; }
    public decimal?      ProviderLng    { get; set; }
    public ServiceType   ServiceType    { get; set; }
    public DateTime      RequestedAt    { get; set; }
}

// ── Provider Approvals ────────────────────────────────────────────────────────

public sealed class AdminApprovalRowDto
{
    public string         ProviderId     { get; set; } = string.Empty;
    public string         Name           { get; set; } = string.Empty;
    public string         Email          { get; set; } = string.Empty;
    public string         Phone          { get; set; } = string.Empty;
    public string         Role           { get; set; } = string.Empty;  // "Provider" | "Seller"
    public string         Specialty      { get; set; } = string.Empty;  // e.g. "Towing", "Fuel", "Mechanic"
    public int            DocumentsCount { get; set; }
    public ProviderStatus Status         { get; set; }
    public DateTime       RegisteredAt   { get; set; }
}

public sealed class AdminApprovalStatsDto
{
    public int Pending  { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}

public sealed class AdminProviderDocsDto
{
    public string              ProviderId { get; set; } = string.Empty;
    public string              Name       { get; set; } = string.Empty;
    public IReadOnlyList<string> Documents { get; set; } = [];
}

public sealed class RejectProviderDto
{
    public string Reason { get; set; } = string.Empty;
}
