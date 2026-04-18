using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Admin;

public sealed class AdminDashboardSummaryDto
{
    public int TotalUsers { get; set; }
    public int TotalOrders { get; set; }
    public int PendingSosRequests { get; set; }
    public int OpenTickets { get; set; }
    public decimal TotalRevenue { get; set; }
}

public sealed class AdminMonthlyOrderStatsDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int OrdersCount { get; set; }
    public decimal TotalAmount { get; set; }
}

public sealed class AdminUserRowDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int Points { get; set; }
}

public sealed class AdminSupportTicketRowDto
{
    public Guid TicketId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class AdminSosRowDto
{
    public Guid RequestId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
    public RequestStatus Status { get; set; }
    public DateTime RequestedAtUtc { get; set; }
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
