using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface ISupportRepository
{
    Task AddTicketAsync(SupportTicket ticket, CancellationToken cancellationToken = default);

    Task<SupportTicket?> GetTicketByIdAsync(Guid ticketId, CancellationToken cancellationToken = default);

    Task<SupportTicket?> GetTicketByIdWithMessagesAsync(Guid ticketId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SupportTicket>> GetTicketsByUserAsync(string userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SupportTicket>> GetRecentTicketsAsync(int limit, CancellationToken cancellationToken = default);

    Task<int> CountOpenTicketsAsync(CancellationToken cancellationToken = default);

    Task AddChatMessageAsync(ChatMessage message, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
