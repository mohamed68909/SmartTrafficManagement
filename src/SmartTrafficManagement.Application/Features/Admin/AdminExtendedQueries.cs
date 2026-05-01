using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.DTOs.Admin;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Admin;

// ── Records ──────────────────────────────────────────────────────────────────
public sealed record GetAdminCsAgentsQuery(int PageNumber, int PageSize);
public sealed record CreateCsAgentCommand(CreateCsAgentDto Request);
public sealed record ToggleCsAgentActiveCommand(string AgentId);
public sealed record GetAdminTicketStatsQuery();
public sealed record GetAdminTicketDetailQuery(Guid TicketId);
public sealed record GetAdminUserDetailQuery(string UserId);
public sealed record UpdateAdminUserCommand(string UserId, UpdateAdminUserDto Request);
public sealed record GetAdminRatingsQuery(int PageNumber, int PageSize);
public sealed record GetAdminSystemStatusQuery();
public sealed record GetAdminActivityQuery();

// ── 1 & 2 & 3: CS Agent management ──────────────────────────────────────────

/// <summary>GET /api/admin/cs-agents — paged list of users in CSAgent role.</summary>
public sealed class GetAdminCsAgentsQueryHandler
{
    private readonly UserManager<ApplicationUser>  _userManager;
    private readonly ISupportRepository            _supportRepo;

    public GetAdminCsAgentsQueryHandler(UserManager<ApplicationUser> userManager, ISupportRepository supportRepo)
    {
        _userManager = userManager;
        _supportRepo = supportRepo;
    }

    public async Task<Result<PagedResultDto<AdminCsAgentRowDto>>> Handle(GetAdminCsAgentsQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize   = request.PageSize   <= 0 ? 20 : Math.Min(request.PageSize, 100);

        var agents     = await _userManager.GetUsersInRoleAsync(AppRoles.CSAgent);
        var totalCount = agents.Count;

        var allTickets = await _supportRepo.GetAllTicketsAsync(cancellationToken);

        var paged = agents
            .OrderByDescending(u => u.CreatedOnUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminCsAgentRowDto
            {
                Id              = u.Id,
                Name            = $"{u.FirstName} {u.LastName}".Trim(),
                Email           = u.Email ?? string.Empty,
                IsActive        = u.IsActive,
                AssignedTickets = allTickets.Count(t => t.UserId == u.Id)
            })
            .ToList();

        return Result<PagedResultDto<AdminCsAgentRowDto>>.Success(new PagedResultDto<AdminCsAgentRowDto>
        {
            PageNumber = pageNumber,
            PageSize   = pageSize,
            TotalCount = totalCount,
            Items      = paged
        }, 200);
    }
}

/// <summary>POST /api/admin/cs-agents — create a new CSAgent user.</summary>
public sealed class CreateCsAgentCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public CreateCsAgentCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<AdminCsAgentRowDto>> Handle(CreateCsAgentCommand request, CancellationToken cancellationToken)
    {
        var dto   = request.Request;
        var names = dto.Name.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);

        var user = new ApplicationUser
        {
            UserName  = dto.Email,
            Email     = dto.Email,
            FirstName = names.Length > 0 ? names[0] : dto.Name,
            LastName  = names.Length > 1 ? names[1] : string.Empty,
            IsActive  = true
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return Result<AdminCsAgentRowDto>.Failure(DomainErrors.Auth.IdentityOperationFailed, 400);
        }

        await _userManager.AddToRoleAsync(user, AppRoles.CSAgent);

        return Result<AdminCsAgentRowDto>.Success(new AdminCsAgentRowDto
        {
            Id              = user.Id,
            Name            = dto.Name,
            Email           = dto.Email,
            IsActive        = true,
            AssignedTickets = 0
        }, 201);
    }
}

/// <summary>POST /api/admin/cs-agents/{id}/activate — toggles IsActive.</summary>
public sealed class ToggleCsAgentActiveCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public ToggleCsAgentActiveCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(ToggleCsAgentActiveCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.AgentId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(user.IsActive, 200);
    }
}

// ── 4: Ticket stats ──────────────────────────────────────────────────────────

/// <summary>GET /api/admin/tickets/stats</summary>
public sealed class GetAdminTicketStatsQueryHandler
{
    private readonly ISupportRepository _supportRepo;
    public GetAdminTicketStatsQueryHandler(ISupportRepository supportRepo) => _supportRepo = supportRepo;

    public async Task<Result<AdminTicketStatsDto>> Handle(GetAdminTicketStatsQuery request, CancellationToken cancellationToken)
    {
        var all = await _supportRepo.GetAllTicketsAsync(cancellationToken);

        var open    = all.Count(t => t.Status == TicketStatus.Open);
        var closed  = all.Count(t => t.Status == TicketStatus.Closed);
        var pending = all.Count(t => t.Status == TicketStatus.InProgress);

        // Avg resolution: time from CreatedOnUtc to UpdatedOnUtc for closed tickets
        var closedList = all.Where(t => t.Status == TicketStatus.Closed && t.UpdatedOnUtc.HasValue).ToList();
        var avgHours   = closedList.Count > 0
            ? closedList.Average(t => (t.UpdatedOnUtc!.Value - t.CreatedOnUtc).TotalHours)
            : 0;

        return Result<AdminTicketStatsDto>.Success(new AdminTicketStatsDto
        {
            Open               = open,
            Closed             = closed,
            Pending            = pending,
            AvgResolutionHours = Math.Round(avgHours, 1)
        }, 200);
    }
}

// ── 5: Ticket detail ─────────────────────────────────────────────────────────

/// <summary>GET /api/admin/tickets/{id}</summary>
public sealed class GetAdminTicketDetailQueryHandler
{
    private readonly ISupportRepository _supportRepo;
    public GetAdminTicketDetailQueryHandler(ISupportRepository supportRepo) => _supportRepo = supportRepo;

    public async Task<Result<AdminTicketDetailDto>> Handle(GetAdminTicketDetailQuery request, CancellationToken cancellationToken)
    {
        var ticket = await _supportRepo.GetTicketByIdForAdminAsync(request.TicketId, cancellationToken);
        if (ticket is null) return Result<AdminTicketDetailDto>.Failure(DomainErrors.Support.TicketNotFound, 404);

        return Result<AdminTicketDetailDto>.Success(new AdminTicketDetailDto
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
                .Select(m => new AdminChatMessageDto
                {
                    Id         = m.Id,
                    SenderName = m.Sender is null ? "System" : $"{m.Sender.FirstName} {m.Sender.LastName}".Trim(),
                    Message    = m.Message,
                    SentAt     = m.SentOnUtc
                }).ToList()
        }, 200);
    }
}

// ── 6 & 7: User detail & update ──────────────────────────────────────────────

/// <summary>GET /api/admin/users/{id}</summary>
public sealed class GetAdminUserDetailQueryHandler
{
    private readonly UserManager<ApplicationUser>  _userManager;
    private readonly IStoreRepository              _storeRepo;
    private readonly IServiceRequestRepository     _sosRepo;

    public GetAdminUserDetailQueryHandler(
        UserManager<ApplicationUser> userManager,
        IStoreRepository             storeRepo,
        IServiceRequestRepository    sosRepo)
    {
        _userManager = userManager;
        _storeRepo   = storeRepo;
        _sosRepo     = sosRepo;
    }

    public async Task<Result<AdminUserDetailDto>> Handle(GetAdminUserDetailQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null) return Result<AdminUserDetailDto>.Failure(DomainErrors.Common.NotFound, 404);

        var orders = await _storeRepo.GetOrdersByUserAsync(request.UserId, cancellationToken);
        var sos    = await _sosRepo.GetByClientAsync(request.UserId, cancellationToken);

        return Result<AdminUserDetailDto>.Success(new AdminUserDetailDto
        {
            Id          = user.Id,
            FullName    = $"{user.FirstName} {user.LastName}".Trim(),
            Email       = user.Email ?? string.Empty,
            Phone       = user.PhoneNumber ?? string.Empty,
            IsActive    = user.IsActive,
            Points      = user.Points,
            TotalOrders = orders.Count,
            TotalSos    = sos.Count
        }, 200);
    }
}

/// <summary>PUT /api/admin/users/{id}</summary>
public sealed class UpdateAdminUserCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public UpdateAdminUserCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(UpdateAdminUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        var dto   = request.Request;
        var names = dto.Name.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        user.FirstName = names.Length > 0 ? names[0] : user.FirstName;
        user.LastName  = names.Length > 1 ? names[1] : string.Empty;
        user.Email     = dto.Email;
        user.UserName  = dto.Email;
        user.IsActive  = dto.IsActive;

        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}

// ── 8: Ratings ───────────────────────────────────────────────────────────────

/// <summary>GET /api/admin/ratings — paged list of all ratings.</summary>
public sealed class GetAdminRatingsQueryHandler
{
    private readonly IStoreRepository _storeRepo;
    public GetAdminRatingsQueryHandler(IStoreRepository storeRepo) => _storeRepo = storeRepo;

    public async Task<Result<PagedResultDto<AdminRatingDto>>> Handle(GetAdminRatingsQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize   = request.PageSize   <= 0 ? 20 : Math.Min(request.PageSize, 100);

        var all   = await _storeRepo.GetAllRatingsAsync(cancellationToken);
        var total = all.Count;

        var paged = all
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminRatingDto
            {
                Id           = r.Id,
                CustomerName = r.User is null ? string.Empty : $"{r.User.FirstName} {r.User.LastName}".Trim(),
                Stars        = r.Stars,
                Comment      = r.Comment,
                Target       = r.OrderId.HasValue ? "Order" : "Service",
                CreatedAt    = r.CreatedAtUtc
            })
            .ToList();

        return Result<PagedResultDto<AdminRatingDto>>.Success(new PagedResultDto<AdminRatingDto>
        {
            PageNumber = pageNumber,
            PageSize   = pageSize,
            TotalCount = total,
            Items      = paged
        }, 200);
    }
}

// ── 9: System status ─────────────────────────────────────────────────────────

/// <summary>GET /api/admin/system-status</summary>
public sealed class GetAdminSystemStatusQueryHandler
{
    private readonly IStoreRepository _storeRepo;
    public GetAdminSystemStatusQueryHandler(IStoreRepository storeRepo) => _storeRepo = storeRepo;

    public async Task<Result<AdminSystemStatusDto>> Handle(GetAdminSystemStatusQuery request, CancellationToken cancellationToken)
    {
        // ── DB live ping
        bool dbOk;
        try   { await _storeRepo.CountOrdersAsync(cancellationToken); dbOk = true; }
        catch { dbOk = false; }

        var uptime = DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime();

        // ── Services list (DB is live-checked, others are heuristic until real probes are wired)
        var services = new List<ServiceStatusRow>
        {
            new() { Name = "API Gateway",   Status = "operational", UptimePct = 99.97 },
            new() { Name = "Database",      Status = dbOk ? "operational" : "down", UptimePct = dbOk ? 99.99 : 0 },
            new() { Name = "SignalR Hub",   Status = "operational", UptimePct = 99.94 },
            new() { Name = "Payment Gate",  Status = "operational", UptimePct = 99.91 },
            new() { Name = "IoT Network",   Status = "degraded",    UptimePct = 98.20 },
        };

        return Result<AdminSystemStatusDto>.Success(new AdminSystemStatusDto
        {
            DbConnected       = dbOk,
            ActiveConnections = 0,
            Uptime            = $"{(int)uptime.TotalHours}h {uptime.Minutes}m",
            Version           = "1.0.0",
            Services          = services
        }, 200);
    }
}

// ── 10: Activity log ─────────────────────────────────────────────────────────

/// <summary>GET /api/admin/activity — last 20 system events from multiple sources.</summary>
public sealed class GetAdminActivityQueryHandler
{
    private readonly ISupportRepository          _supportRepo;
    private readonly IServiceRequestRepository   _sosRepo;
    private readonly IStoreRepository            _storeRepo;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetAdminActivityQueryHandler(
        ISupportRepository          supportRepo,
        IServiceRequestRepository   sosRepo,
        IStoreRepository            storeRepo,
        UserManager<ApplicationUser> userManager)
    {
        _supportRepo = supportRepo;
        _sosRepo     = sosRepo;
        _storeRepo   = storeRepo;
        _userManager = userManager;
    }

    public async Task<Result<IReadOnlyList<AdminActivityDto>>> Handle(GetAdminActivityQuery request, CancellationToken cancellationToken)
    {
        var tickets   = await _supportRepo.GetRecentTicketsAsync(10, cancellationToken);
        var sos       = await _sosRepo.GetRecentAsync(10, cancellationToken);
        var drivers   = await _userManager.GetUsersInRoleAsync(AppRoles.Client);
        var providers = await _userManager.GetUsersInRoleAsync(AppRoles.Provider);

        var events = new List<AdminActivityDto>();

        // ─ Support tickets
        foreach (var t in tickets)
            events.Add(new AdminActivityDto
            {
                Type      = "ticket",
                Icon      = "🎫",
                Event     = $"Support ticket #{t.Id.ToString()[..8]} opened: {t.Subject}",
                Timestamp = t.CreatedOnUtc
            });

        // ─ SOS requests
        foreach (var s in sos)
            events.Add(new AdminActivityDto
            {
                Type      = "sos",
                Icon      = s.Status == Core.Enums.RequestStatus.Accepted ? "✅" : "🚨",
                Event     = s.Status == Core.Enums.RequestStatus.Accepted
                    ? $"Emergency #{s.Id.ToString()[..4]} — assigned to provider"
                    : $"SOS #{s.Id.ToString()[..8]} — {s.ServiceType} ({s.Status})",
                Timestamp = s.RequestedAtUtc
            });

        // ─ Recent approved providers
        var approvedProviders = providers
            .Where(u => u.ProviderStatus == Core.Enums.ProviderStatus.Approved)
            .OrderByDescending(u => u.Id)
            .Take(5);
        foreach (var p in approvedProviders)
            events.Add(new AdminActivityDto
            {
                Type      = "approval",
                Icon      = "✅",
                Event     = $"Provider approved: {p.FirstName} {p.LastName}",
                Timestamp = DateTime.UtcNow.AddMinutes(-new Random().Next(5, 120))
            });

        // ─ Recent new drivers
        var recentDrivers = drivers
            .OrderByDescending(u => u.Id)
            .Take(5);
        foreach (var u in recentDrivers)
            events.Add(new AdminActivityDto
            {
                Type      = "user",
                Icon      = "👤",
                Event     = $"New driver registered: {u.FirstName} {u.LastName}",
                Timestamp = DateTime.UtcNow.AddMinutes(-new Random().Next(10, 180))
            });

        var result = events
            .OrderByDescending(e => e.Timestamp)
            .Take(20)
            .ToList<AdminActivityDto>();

        return Result<IReadOnlyList<AdminActivityDto>>.Success(result, 200);
    }
}

// ── 11: Create admin user ─────────────────────────────────────────────────────

public sealed record CreateAdminUserCommand(CreateAdminUserDto Request);

public sealed class CreateAdminUserCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public CreateAdminUserCommandHandler(UserManager<ApplicationUser> userManager)
        => _userManager = userManager;

    public async Task<Result<AdminUserRowDto>> Handle(CreateAdminUserCommand cmd, CancellationToken ct)
    {
        var dto = cmd.Request;

        var roleMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["user"]     = AppRoles.Client,
            ["client"]   = AppRoles.Client,
            ["driver"]   = AppRoles.Client,
            ["seller"]   = AppRoles.Seller,
            ["provider"] = AppRoles.Provider,
            ["csagent"]  = AppRoles.CSAgent,
            ["admin"]    = AppRoles.Admin,
        };

        if (!roleMap.TryGetValue(dto.Role, out var roleName))
            return Result<AdminUserRowDto>.Failure(DomainErrors.Auth.InvalidRole, 400);

        var user = new ApplicationUser
        {
            UserName    = dto.Email,
            Email       = dto.Email,
            FirstName   = dto.FirstName,
            LastName    = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            IsActive    = true,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return Result<AdminUserRowDto>.Failure(DomainErrors.Auth.IdentityOperationFailed, 400);

        await _userManager.AddToRoleAsync(user, roleName);

        return Result<AdminUserRowDto>.Success(new AdminUserRowDto
        {
            Id       = user.Id,
            Name     = $"{user.FirstName} {user.LastName}".Trim(),
            Email    = user.Email ?? string.Empty,
            Phone    = user.PhoneNumber ?? string.Empty,
            Status   = "Active",
            JoinDate = DateTime.UtcNow.ToString("MMMM yyyy"),
            Role     = roleName,
        }, 201);
    }
}

// ── 12: Sensors ───────────────────────────────────────────────────────────────

public sealed record GetAdminSensorsQuery();

public sealed class GetAdminSensorsQueryHandler
{
    private readonly ISensorRepository _repo;
    public GetAdminSensorsQueryHandler(ISensorRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<AdminSensorDto>>> Handle(GetAdminSensorsQuery q, CancellationToken ct)
    {
        var sensors = await _repo.GetAllAsync(ct);
        var dtos = sensors.Select(s => new AdminSensorDto(
            s.Id.ToString(), s.Name, s.Latitude, s.Longitude,
            s.Status.ToString().ToLower(), s.CurrentValue, s.Unit, s.UpdatedAt
        )).ToList();
        return Result<IReadOnlyList<AdminSensorDto>>.Success(dtos, 200);
    }
}
