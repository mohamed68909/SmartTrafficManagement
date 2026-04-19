using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Cs;

public sealed class CsDriverDto
{
    public string  Id          { get; set; } = string.Empty;
    public string  FullName    { get; set; } = string.Empty;
    public string  Email       { get; set; } = string.Empty;
    public string  Phone       { get; set; } = string.Empty;
    public bool    IsActive    { get; set; }
}

public sealed class CsDriverContextDto
{
    public string                        Id             { get; set; } = string.Empty;
    public string                        FullName       { get; set; } = string.Empty;
    public string                        Email          { get; set; } = string.Empty;
    public string                        Phone          { get; set; } = string.Empty;
    public bool                          IsActive       { get; set; }
    public IReadOnlyList<CsVehicleDto>   Vehicles       { get; set; } = [];
    public IReadOnlyList<CsSosRowDto>    RecentSos      { get; set; } = [];
    public IReadOnlyList<CsTicketRowDto> OpenTickets    { get; set; } = [];
}

public sealed class CsVehicleDto
{
    public Guid   Id          { get; set; }
    public string Brand       { get; set; } = string.Empty;
    public string Model       { get; set; } = string.Empty;
    public string PlateNumber { get; set; } = string.Empty;
    public int    Year        { get; set; }
}

public sealed class CsSosRowDto
{
    public Guid          RequestId  { get; set; }
    public ServiceType   ServiceType { get; set; }
    public RequestStatus Status      { get; set; }
    public DateTime      RequestedAt { get; set; }
}

public sealed class CsTicketRowDto
{
    public Guid         TicketId  { get; set; }
    public string       Subject   { get; set; } = string.Empty;
    public TicketStatus Status    { get; set; }
    public DateTime     CreatedAt { get; set; }
}

public sealed class ToggleCsAgentOnlineDto
{
    public bool Online { get; set; }
}

public sealed class CsTicketStatsDto
{
    public int    Open               { get; set; }
    public int    Closed             { get; set; }
    public int    Pending            { get; set; }
    public double AvgResponseHours   { get; set; }
}

public sealed class CsTicketFullDto
{
    public Guid                          TicketId    { get; set; }
    public string                        UserName    { get; set; } = string.Empty;
    public string                        Subject     { get; set; } = string.Empty;
    public string                        Description { get; set; } = string.Empty;
    public TicketStatus                  Status      { get; set; }
    public TicketPriority                Priority    { get; set; }
    public DateTime                      CreatedAt   { get; set; }
    public IReadOnlyList<CsMessageDto>   Messages    { get; set; } = [];
}

public sealed class CsMessageDto
{
    public Guid     Id         { get; set; }
    public string   SenderName { get; set; } = string.Empty;
    public string   Message    { get; set; } = string.Empty;
    public DateTime SentAt     { get; set; }
}
