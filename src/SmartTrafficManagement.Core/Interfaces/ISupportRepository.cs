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

    /// <summary>Returns all tickets (no limit) for aggregate stats.</summary>
    Task<IReadOnlyList<SupportTicket>> GetAllTicketsAsync(CancellationToken cancellationToken = default);

    /// <summary>Full ticket with user + messages for admin detail view.</summary>
    Task<SupportTicket?> GetTicketByIdForAdminAsync(Guid ticketId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
