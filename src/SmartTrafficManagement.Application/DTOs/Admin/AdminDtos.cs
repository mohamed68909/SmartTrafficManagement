using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Admin;

// ── Existing DTOs ────────────────────────────────────────────────────────────

public sealed class AdminDashboardSummaryDto
{
    public int     TotalUsers         { get; set; }
    public int     TotalOrders        { get; set; }
    public int     PendingSosRequests { get; set; }
    public int     OpenTickets        { get; set; }
    public decimal TotalRevenue       { get; set; }
}

public sealed class AdminMonthlyOrderStatsDto
{
    public int     Year        { get; set; }
    public int     Month       { get; set; }
    public int     OrdersCount { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class AdminUserRowDto
{
    public string Id          { get; set; } = string.Empty;
    public string FullName    { get; set; } = string.Empty;
    public string Email       { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool   IsActive    { get; set; }
    public int    Points      { get; set; }
}

public sealed class AdminSupportTicketRowDto
{
    public Guid         TicketId  { get; set; }
    public string       UserName  { get; set; } = string.Empty;
    public string       Subject   { get; set; } = string.Empty;
    public TicketStatus Status    { get; set; }
    public DateTime     CreatedAt { get; set; }
}

public sealed class AdminSosRowDto
{
    public Guid          RequestId      { get; set; }
    public string        ClientName     { get; set; } = string.Empty;
    public string        ProviderName   { get; set; } = string.Empty;
    public ServiceType   ServiceType    { get; set; }
    public RequestStatus Status         { get; set; }
    public DateTime      RequestedAtUtc { get; set; }
}

public sealed class AdminProviderRowDto
{
    public string Id                 { get; set; } = string.Empty;
    public string FullName           { get; set; } = string.Empty;
    public string Email              { get; set; } = string.Empty;
    public string PhoneNumber        { get; set; } = string.Empty;
    public bool   IsActive           { get; set; }
    public int    TotalJobsCompleted { get; set; }
}

// ── New DTOs ─────────────────────────────────────────────────────────────────

// 1 & 2 & 3 – CS Agents
public sealed class AdminCsAgentRowDto
{
    public string Id               { get; set; } = string.Empty;
    public string Name             { get; set; } = string.Empty;
    public string Email            { get; set; } = string.Empty;
    public bool   IsActive         { get; set; }
    public int    AssignedTickets  { get; set; }
}

public sealed class CreateCsAgentDto
{
    public string Name     { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// 4 – Ticket stats
public sealed class AdminTicketStatsDto
{
    public int    Open                 { get; set; }
    public int    Closed               { get; set; }
    public int    Pending              { get; set; }
    public double AvgResolutionHours   { get; set; }
}

// 5 – Ticket details
public sealed class AdminTicketDetailDto
{
    public Guid                          TicketId     { get; set; }
    public string                        UserName     { get; set; } = string.Empty;
    public string                        Subject      { get; set; } = string.Empty;
    public string                        Description  { get; set; } = string.Empty;
    public TicketStatus                  Status       { get; set; }
    public TicketPriority                Priority     { get; set; }
    public DateTime                      CreatedAt    { get; set; }
    public IReadOnlyList<AdminChatMessageDto> Messages { get; set; } = [];
}

public sealed class AdminChatMessageDto
{
    public Guid    Id         { get; set; }
    public string  SenderName { get; set; } = string.Empty;
    public string  Message    { get; set; } = string.Empty;
    public DateTime SentAt    { get; set; }
}

// 6 & 7 – Full user details
public sealed class AdminUserDetailDto
{
    public string  Id          { get; set; } = string.Empty;
    public string  FullName    { get; set; } = string.Empty;
    public string  Email       { get; set; } = string.Empty;
    public string  Phone       { get; set; } = string.Empty;
    public bool    IsActive    { get; set; }
    public int     Points      { get; set; }
    public int     TotalOrders { get; set; }
    public int     TotalSos    { get; set; }
}

public sealed class UpdateAdminUserDto
{
    public string Name     { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public bool   IsActive { get; set; }
}

// 8 – Ratings
public sealed class AdminRatingDto
{
    public Guid     Id           { get; set; }
    public string   CustomerName { get; set; } = string.Empty;
    public int      Stars        { get; set; }
    public string?  Comment      { get; set; }
    public string   Target       { get; set; } = string.Empty;  // "Order" or "Service"
    public DateTime CreatedAt    { get; set; }
}

// 9 – System status
public sealed class AdminSystemStatusDto
{
    public bool   DbConnected        { get; set; }
    public int    ActiveConnections  { get; set; }
    public string Uptime             { get; set; } = string.Empty;
    public string Version            { get; set; } = string.Empty;
}

// 10 – Activity log
public sealed class AdminActivityDto
{
    public string   Event     { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
