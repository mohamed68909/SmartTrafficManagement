using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace SmartTrafficManagement.Infrastructure.Realtime;

public sealed class TrafficHub : Hub
{
    private readonly IServiceScopeFactory _scopeFactory;

    public TrafficHub(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task SendMessage(Guid ticketId, string senderId, string message, ChatMessageType type = ChatMessageType.Text)
    {
        await Clients.Group(ticketId.ToString()).SendAsync("ReceiveMessage", new
        {
            TicketId = ticketId,
            SenderId = senderId,
            Message = message,
            Type = type.ToString(),
            SentOnUtc = DateTime.UtcNow
        });

        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var supportRepository = scope.ServiceProvider.GetRequiredService<ISupportRepository>();
            await supportRepository.AddChatMessageAsync(new ChatMessage
            {
                SupportTicketId = ticketId,
                SenderId = senderId,
                Message = message,
                Type = type,
                SentOnUtc = DateTime.UtcNow
            });
            await supportRepository.SaveChangesAsync();
        });
    }

    public async Task JoinTicketRoom(Guid ticketId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, ticketId.ToString());
    }
}
