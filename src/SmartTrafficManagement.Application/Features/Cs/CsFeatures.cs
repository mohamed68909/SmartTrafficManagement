using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Application.DTOs.Cs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Cs;

// ── Records ──────────────────────────────────────────────────────────────────
public sealed record GetCsTicketStatsQuery();
public sealed record GetCsTicketDetailQuery(Guid TicketId);
public sealed record EscalateTicketCommand(string AgentId, Guid TicketId);
public sealed record SearchDriversQuery(string Term);
public sealed record GetDriverContextQuery(string DriverId);
public sealed record BlockDriverCommand(string DriverId);
public sealed record ToggleCsAgentOnlineCommand(string AgentId, bool Online);

// ── 1. Ticket stats (CSAgent / Admin view) ───────────────────────────────────

/// <summary>GET /api/support/tickets/stats</summary>
public sealed class GetCsTicketStatsQueryHandler
{
    private readonly ISupportRepository _repo;
    public GetCsTicketStatsQueryHandler(ISupportRepository repo) => _repo = repo;

    public async Task<Result<CsTicketStatsDto>> Handle(GetCsTicketStatsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllTicketsAsync(cancellationToken);

        var open    = all.Count(t => t.Status == TicketStatus.Open);
        var closed  = all.Count(t => t.Status == TicketStatus.Closed);
        var pending = all.Count(t => t.Status == TicketStatus.InProgress);

        var closedList = all.Where(t => t.Status == TicketStatus.Closed && t.UpdatedOnUtc.HasValue).ToList();
        var avgHours   = closedList.Count > 0
            ? closedList.Average(t => (t.UpdatedOnUtc!.Value - t.CreatedOnUtc).TotalHours)
            : 0;

        return Result<CsTicketStatsDto>.Success(new CsTicketStatsDto
        {
            Open             = open,
            Closed           = closed,
            Pending          = pending,
            AvgResponseHours = Math.Round(avgHours, 1)
        }, 200);
    }
}

// ── 2. Ticket full detail (CSAgent / Admin view) ──────────────────────────────

/// <summary>GET /api/support/tickets/{id}</summary>
public sealed class GetCsTicketDetailQueryHandler
{
    private readonly ISupportRepository _repo;
    public GetCsTicketDetailQueryHandler(ISupportRepository repo) => _repo = repo;

    public async Task<Result<CsTicketFullDto>> Handle(GetCsTicketDetailQuery request, CancellationToken cancellationToken)
    {
        var ticket = await _repo.GetTicketByIdForAdminAsync(request.TicketId, cancellationToken);
        if (ticket is null) return Result<CsTicketFullDto>.Failure(DomainErrors.Support.TicketNotFound, 404);

        return Result<CsTicketFullDto>.Success(new CsTicketFullDto
        {
            TicketId    = ticket.Id,
            UserName    = $"{ticket.User.FirstName} {ticket.User.LastName}".Trim(),
            Subject     = ticket.Subject,
            Description = ticket.Description,
            Status      = ticket.Status,
            Priority    = ticket.Priority,
            CreatedAt   = ticket.CreatedOnUtc,
            Messages    = ticket.ChatMessages
                .OrderBy(m => m.SentOnUtc)
                .Select(m => new CsMessageDto
                {
                    Id         = m.Id,
                    SenderName = m.Sender is null ? "System" : $"{m.Sender.FirstName} {m.Sender.LastName}".Trim(),
                    Message    = m.Message,
                    SentAt     = m.SentOnUtc
                }).ToList()
        }, 200);
    }
}

// ── 3. Escalate ticket ────────────────────────────────────────────────────────

/// <summary>POST /api/support/tickets/{id}/escalate</summary>
public sealed class EscalateTicketCommandHandler
{
    private readonly ISupportRepository _repo;
    public EscalateTicketCommandHandler(ISupportRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(EscalateTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _repo.GetTicketByIdAsync(request.TicketId, cancellationToken);
        if (ticket is null) return Result<bool>.Failure(DomainErrors.Support.TicketNotFound, 404);

        // Escalation = set priority to Urgent, status to InProgress
        ticket.Priority    = TicketPriority.Urgent;
        ticket.Status      = TicketStatus.InProgress;
        ticket.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true, 200);
    }
}

// ── 4. Driver search ──────────────────────────────────────────────────────────

/// <summary>GET /api/cs/drivers/search?q=...</summary>
public sealed class SearchDriversQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public SearchDriversQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<IReadOnlyList<CsDriverDto>>> Handle(SearchDriversQuery request, CancellationToken cancellationToken)
    {
        var term = request.Term.Trim().ToLower();

        var users = await _userManager.Users
            .AsNoTracking()
            .Where(u =>
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term)  ||
                (u.Email != null && u.Email.ToLower().Contains(term)))
            .OrderBy(u => u.FirstName)
            .Take(20)
            .ToListAsync(cancellationToken);

        var result = users.Select(u => new CsDriverDto
        {
            Id       = u.Id,
            FullName = $"{u.FirstName} {u.LastName}".Trim(),
            Email    = u.Email ?? string.Empty,
            Phone    = u.PhoneNumber ?? string.Empty,
            IsActive = u.IsActive
        }).ToList<CsDriverDto>();

        return Result<IReadOnlyList<CsDriverDto>>.Success(result, 200);
    }
}

// ── 5. Driver context ─────────────────────────────────────────────────────────

/// <summary>GET /api/cs/drivers/{id}</summary>
public sealed class GetDriverContextQueryHandler
{
    private readonly UserManager<ApplicationUser>  _userManager;
    private readonly IServiceRequestRepository     _sosRepo;
    private readonly ISupportRepository            _supportRepo;

    public GetDriverContextQueryHandler(
        UserManager<ApplicationUser>  userManager,
        IServiceRequestRepository     sosRepo,
        ISupportRepository            supportRepo)
    {
        _userManager = userManager;
        _sosRepo     = sosRepo;
        _supportRepo = supportRepo;
    }

    public async Task<Result<CsDriverContextDto>> Handle(GetDriverContextQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .Include(u => u.Vehicles)
            .FirstOrDefaultAsync(u => u.Id == request.DriverId, cancellationToken);

        if (user is null) return Result<CsDriverContextDto>.Failure(DomainErrors.Common.NotFound, 404);

        var sosTask     = _sosRepo.GetByClientAsync(request.DriverId, cancellationToken);
        var ticketsTask = _supportRepo.GetTicketsByUserAsync(request.DriverId, cancellationToken);
        await Task.WhenAll(sosTask, ticketsTask);

        return Result<CsDriverContextDto>.Success(new CsDriverContextDto
        {
            Id       = user.Id,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Email    = user.Email ?? string.Empty,
            Phone    = user.PhoneNumber ?? string.Empty,
            IsActive = user.IsActive,
            Vehicles = user.Vehicles
                .Where(v => !v.IsDeleted)
                .Select(v => new CsVehicleDto
                {
                    Id          = v.Id,
                    Brand       = v.Brand,
                    Model       = v.Model,
                    PlateNumber = v.PlateNumber,
                    Year        = v.Year
                }).ToList(),
            RecentSos = sosTask.Result
                .OrderByDescending(s => s.RequestedAtUtc)
                .Take(10)
                .Select(s => new CsSosRowDto
                {
                    RequestId   = s.Id,
                    ServiceType = s.ServiceType,
                    Status      = s.Status,
                    RequestedAt = s.RequestedAtUtc
                }).ToList(),
            OpenTickets = ticketsTask.Result
                .Where(t => t.Status != TicketStatus.Closed)
                .Select(t => new CsTicketRowDto
                {
                    TicketId  = t.Id,
                    Subject   = t.Subject,
                    Status    = t.Status,
                    CreatedAt = t.CreatedOnUtc
                }).ToList()
        }, 200);
    }
}

// ── 6. Block driver ───────────────────────────────────────────────────────────

/// <summary>POST /api/cs/drivers/{id}/block</summary>
public sealed class BlockDriverCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public BlockDriverCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(BlockDriverCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.DriverId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        user.IsActive = false;
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}

// ── 7. Toggle agent online status ────────────────────────────────────────────

/// <summary>POST /api/cs/agent/status</summary>
public sealed class ToggleCsAgentOnlineCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public ToggleCsAgentOnlineCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(ToggleCsAgentOnlineCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.AgentId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        user.IsActive = request.Online;
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(request.Online, 200);
    }
}
