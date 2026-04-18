using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class ChatMessage : BaseEntity
{
    public Guid SupportTicketId { get; set; }

    public string SenderId { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public ChatMessageType Type { get; set; } = ChatMessageType.Text;

    public bool IsRead { get; set; }

    public DateTime SentOnUtc { get; set; } = DateTime.UtcNow;

    public SupportTicket SupportTicket { get; set; } = null!;

    public ApplicationUser Sender { get; set; } = null!;
}
