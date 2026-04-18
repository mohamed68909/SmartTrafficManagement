using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class SupportTicket : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TicketStatus Status { get; set; } = TicketStatus.Open;

    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    public ApplicationUser User { get; set; } = null!;

    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}
