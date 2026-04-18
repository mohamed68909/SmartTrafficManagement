using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs;

public sealed class MessageDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public ChatMessageType Type { get; set; }
    public DateTime SentOnUtc { get; set; }
}
