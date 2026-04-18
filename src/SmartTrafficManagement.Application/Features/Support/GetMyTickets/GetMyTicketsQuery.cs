using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Support.GetMyTickets;

public sealed class MyTicketDto
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed record GetMyTicketsQuery(string UserId);

public sealed class GetMyTicketsQueryHandler
{
    private readonly ISupportRepository _repo;
    public GetMyTicketsQueryHandler(ISupportRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<MyTicketDto>>> Handle(GetMyTicketsQuery request, CancellationToken cancellationToken)
    {
        var tickets = await _repo.GetTicketsByUserAsync(request.UserId, cancellationToken);
        var items = tickets.Select(x => new MyTicketDto
        {
            Id = x.Id,
            Subject = x.Subject,
            Status = x.Status,
            CreatedAt = x.CreatedOnUtc
        }).ToList();

        return Result<IReadOnlyList<MyTicketDto>>.Success(items, 200);
    }
}
