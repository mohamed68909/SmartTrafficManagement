namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class SupportRepository : ISupportRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SupportRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddTicketAsync(SupportTicket ticket, CancellationToken cancellationToken = default)
    {
        await _dbContext.SupportTickets.AddAsync(ticket, cancellationToken);
    }

    public async Task<SupportTicket?> GetTicketByIdAsync(Guid ticketId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets.FirstOrDefaultAsync(x => x.Id == ticketId, cancellationToken);
    }

    public async Task<SupportTicket?> GetTicketByIdWithMessagesAsync(Guid ticketId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets
            .Include(x => x.ChatMessages)
            .ThenInclude(x => x.Sender)
            .FirstOrDefaultAsync(x => x.Id == ticketId, cancellationToken);
    }

    public async Task<IReadOnlyList<SupportTicket>> GetTicketsByUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SupportTicket>> GetRecentTicketsAsync(int limit, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets
            .AsNoTracking()
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedOnUtc)
            .Take(limit <= 0 ? 20 : limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountOpenTicketsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets.CountAsync(x => x.Status != Core.Enums.TicketStatus.Closed, cancellationToken);
    }

    public async Task AddChatMessageAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        await _dbContext.ChatMessages.AddAsync(message, cancellationToken);
    }

    public async Task<IReadOnlyList<SupportTicket>> GetAllTicketsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets
            .AsNoTracking()
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<SupportTicket?> GetTicketByIdForAdminAsync(Guid ticketId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SupportTickets
            .Include(x => x.User)
            .Include(x => x.ChatMessages)
            .ThenInclude(x => x.Sender)
            .FirstOrDefaultAsync(x => x.Id == ticketId, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
