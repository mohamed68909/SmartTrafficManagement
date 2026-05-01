using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.DTOs.Admin;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Admin;

public sealed record GetAdminDashboardSummaryQuery();
public sealed record GetMonthlyOrderAnalyticsQuery(int Months);
public sealed record GetAdminUsersQuery(int PageNumber, int PageSize, string? Role = null);
public sealed record GetRecentSupportTicketsQuery(int Limit);
public sealed record GetRecentSosRequestsQuery(int Limit, string? Type = null);

public sealed class GetAdminDashboardSummaryQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IStoreRepository            _storeRepository;
    private readonly IServiceRequestRepository   _serviceRequestRepository;
    private readonly ISupportRepository          _supportRepository;
    private readonly ISensorRepository           _sensorRepository;

    public GetAdminDashboardSummaryQueryHandler(
        UserManager<ApplicationUser> userManager,
        IStoreRepository             storeRepository,
        IServiceRequestRepository    serviceRequestRepository,
        ISupportRepository           supportRepository,
        ISensorRepository            sensorRepository)
    {
        _userManager              = userManager;
        _storeRepository          = storeRepository;
        _serviceRequestRepository = serviceRequestRepository;
        _supportRepository        = supportRepository;
        _sensorRepository         = sensorRepository;
    }

    public async Task<Result<AdminDashboardSummaryDto>> Handle(GetAdminDashboardSummaryQuery query, CancellationToken cancellationToken)
    {
        // All queries MUST be sequential — EF Core DbContext is NOT thread-safe.
        // Running Task.WhenAll on scoped DbContext causes InvalidOperationException.
        var totalUsers   = await _userManager.Users.CountAsync(cancellationToken);
        var totalOrders  = await _storeRepository.CountOrdersAsync(cancellationToken);
        var pendingSos   = await _serviceRequestRepository.CountPendingAsync(cancellationToken);
        var openTickets  = await _supportRepository.CountOpenTicketsAsync(cancellationToken);
        var revenue      = await _storeRepository.SumPaidOrdersTotalAsync(cancellationToken);
        var sensors      = await _sensorRepository.GetAllAsync(cancellationToken);
        var providers    = await _userManager.GetUsersInRoleAsync(AppRoles.Provider);
        var sellers      = await _userManager.GetUsersInRoleAsync(AppRoles.Seller);

        var pendingApprovals = providers
            .Count(u => u.ProviderStatus == SmartTrafficManagement.Core.Enums.ProviderStatus.Pending);

        return Result<AdminDashboardSummaryDto>.Success(new AdminDashboardSummaryDto
        {
            TotalUsers            = totalUsers,
            TotalProviders        = providers.Count,
            TotalSellers          = sellers.Count,
            TotalSensors          = sensors.Count,
            TotalOrders           = totalOrders,
            PendingSosRequests    = pendingSos,
            OpenTickets           = openTickets,
            TotalPendingApprovals = pendingApprovals,
            TotalRevenue          = revenue
        }, 200);
    }

}

public sealed class GetMonthlyOrderAnalyticsQueryHandler
{
    private readonly IStoreRepository _storeRepository;
    public GetMonthlyOrderAnalyticsQueryHandler(IStoreRepository storeRepository) => _storeRepository = storeRepository;

    public async Task<Result<IReadOnlyList<AdminMonthlyOrderStatsDto>>> Handle(GetMonthlyOrderAnalyticsQuery query, CancellationToken cancellationToken)
    {
        var months = query.Months <= 0 ? 12 : Math.Min(query.Months, 24);
        var fromUtc = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-months + 1);
        var toUtc = DateTime.UtcNow.AddDays(1);
        var orders = await _storeRepository.GetOrdersBetweenAsync(fromUtc, toUtc, cancellationToken);

        var result = orders
            .GroupBy(x => new { x.CreatedOnUtc.Year, x.CreatedOnUtc.Month })
            .Select(g => new AdminMonthlyOrderStatsDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                OrdersCount = g.Count(),
                TotalAmount = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToList();

        return Result<IReadOnlyList<AdminMonthlyOrderStatsDto>>.Success(result, 200);
    }
}

public sealed class GetAdminUsersQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public GetAdminUsersQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<PagedResultDto<AdminUserRowDto>>> Handle(GetAdminUsersQuery query, CancellationToken cancellationToken)
    {
        var pageNumber = query.PageNumber <= 0 ? 1 : query.PageNumber;
        var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 100);
        
        IQueryable<ApplicationUser> allUsers = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            // Simple mapping since frontend sends "user" but backend uses "Client" usually, or just use exactly.
            // Let's ensure role name capitalization
            var roleName = char.ToUpper(query.Role[0]) + query.Role.Substring(1).ToLower();
            // Map frontend aliases to actual role names
            if (roleName == "User" || roleName == "Client" || roleName == "Driver")
                roleName = AppRoles.Client;
            
            var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);
            var ids = usersInRole.Select(u => u.Id).ToHashSet();
            allUsers = allUsers.Where(u => ids.Contains(u.Id));
        }

        var totalCount = await allUsers.CountAsync(cancellationToken);

        var users = await allUsers
            .OrderByDescending(x => x.CreatedOnUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<AdminUserRowDto>();
        foreach (var x in users)
        {
            var userRoles = await _userManager.GetRolesAsync(x);
            var role = userRoles.FirstOrDefault() ?? string.Empty;

            items.Add(new AdminUserRowDto
            {
                Id = x.Id,
                FullName = $"{x.FirstName} {x.LastName}".Trim(),
                Email = x.Email ?? string.Empty,
                PhoneNumber = x.PhoneNumber ?? string.Empty,
                IsActive = x.IsActive,
                Points = x.Points,
                Role = role
            });
        }

        return Result<PagedResultDto<AdminUserRowDto>>.Success(new PagedResultDto<AdminUserRowDto>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items
        }, 200);
    }
}

public sealed class GetRecentSupportTicketsQueryHandler
{
    private readonly ISupportRepository _supportRepository;
    public GetRecentSupportTicketsQueryHandler(ISupportRepository supportRepository) => _supportRepository = supportRepository;

    public async Task<Result<IReadOnlyList<AdminSupportTicketRowDto>>> Handle(GetRecentSupportTicketsQuery query, CancellationToken cancellationToken)
    {
        var tickets = await _supportRepository.GetRecentTicketsAsync(query.Limit, cancellationToken);
        var items = tickets.Select(x => new AdminSupportTicketRowDto
        {
            TicketId = x.Id,
            UserName = $"{x.User.FirstName} {x.User.LastName}".Trim(),
            Subject = x.Subject,
            Status = x.Status,
            CreatedAt = x.CreatedOnUtc
        }).ToList();
        return Result<IReadOnlyList<AdminSupportTicketRowDto>>.Success(items, 200);
    }
}

public sealed class GetRecentSosRequestsQueryHandler
{
    private readonly IServiceRequestRepository _serviceRequestRepository;
    public GetRecentSosRequestsQueryHandler(IServiceRequestRepository serviceRequestRepository) => _serviceRequestRepository = serviceRequestRepository;

    public async Task<Result<IReadOnlyList<AdminSosRowDto>>> Handle(GetRecentSosRequestsQuery query, CancellationToken cancellationToken)
    {
        var requests = await _serviceRequestRepository.GetRecentAsync(query.Limit, cancellationToken);
        var query2 = requests.AsQueryable();
        if (!string.IsNullOrEmpty(query.Type))
            query2 = query2.Where(s => s.ServiceType.ToString() == query.Type);
        var items = query2.Select(x => new AdminSosRowDto
        {
            RequestId = x.Id,
            ClientName = $"{x.Client.FirstName} {x.Client.LastName}".Trim(),
            ProviderName = x.Provider == null ? string.Empty : $"{x.Provider.FirstName} {x.Provider.LastName}".Trim(),
            ServiceType = x.ServiceType,
            Status = x.Status,
            RequestedAtUtc = x.RequestedAtUtc
        }).ToList();
        return Result<IReadOnlyList<AdminSosRowDto>>.Success(items, 200);
    }
}

public sealed record GetAdminProvidersQuery(int PageNumber, int PageSize);

public sealed class GetAdminProvidersQueryHandler
{
    private readonly UserManager<ApplicationUser>  _userManager;
    private readonly IServiceRequestRepository     _serviceRequestRepository;

    public GetAdminProvidersQueryHandler(
        UserManager<ApplicationUser>  userManager,
        IServiceRequestRepository     serviceRequestRepository)
    {
        _userManager              = userManager;
        _serviceRequestRepository = serviceRequestRepository;
    }

    public async Task<Result<PagedResultDto<AdminProviderRowDto>>> Handle(
        GetAdminProvidersQuery query,
        CancellationToken cancellationToken)
    {
        var pageNumber = query.PageNumber <= 0 ? 1 : query.PageNumber;
        var pageSize   = query.PageSize   <= 0 ? 20 : Math.Min(query.PageSize, 100);

        var providerIds = (await _userManager.GetUsersInRoleAsync(AppRoles.Provider))
            .Select(u => u.Id)
            .ToHashSet();

        var allProviders = _userManager.Users
            .AsNoTracking()
            .Where(u => providerIds.Contains(u.Id));

        var totalCount = await allProviders.CountAsync(cancellationToken);

        var providers = await allProviders
            .OrderByDescending(u => u.CreatedOnUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<AdminProviderRowDto>();
        foreach (var p in providers)
        {
            var completedJobs = await _serviceRequestRepository
                .CountCompletedByProviderAsync(p.Id, cancellationToken);

            items.Add(new AdminProviderRowDto
            {
                Id                 = p.Id,
                FullName           = $"{p.FirstName} {p.LastName}".Trim(),
                Email              = p.Email ?? string.Empty,
                PhoneNumber        = p.PhoneNumber ?? string.Empty,
                IsActive           = p.IsActive,
                TotalJobsCompleted = completedJobs
            });
        }

        return Result<PagedResultDto<AdminProviderRowDto>>.Success(
            new PagedResultDto<AdminProviderRowDto>
            {
                PageNumber = pageNumber,
                PageSize   = pageSize,
                TotalCount = totalCount,
                Items      = items
            }, 200);
    }
}
