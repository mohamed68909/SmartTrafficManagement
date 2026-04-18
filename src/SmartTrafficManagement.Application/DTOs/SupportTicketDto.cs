using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs;

public sealed class SupportTicketDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    public DateTime CreatedOnUtc { get; set; }
}
