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
public sealed record GetAdminUsersQuery(int PageNumber, int PageSize);
public sealed record GetRecentSupportTicketsQuery(int Limit);
public sealed record GetRecentSosRequestsQuery(int Limit);

public sealed class GetAdminDashboardSummaryQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IStoreRepository _storeRepository;
    private readonly IServiceRequestRepository _serviceRequestRepository;
    private readonly ISupportRepository _supportRepository;

    public GetAdminDashboardSummaryQueryHandler(
        UserManager<ApplicationUser> userManager,
        IStoreRepository storeRepository,
        IServiceRequestRepository serviceRequestRepository,
        ISupportRepository supportRepository)
    {
        _userManager = userManager;
        _storeRepository = storeRepository;
        _serviceRequestRepository = serviceRequestRepository;
        _supportRepository = supportRepository;
    }

    public async Task<Result<AdminDashboardSummaryDto>> Handle(GetAdminDashboardSummaryQuery query, CancellationToken cancellationToken)
    {
        var totalUsers = await _userManager.Users.CountAsync(cancellationToken);
        var totalOrders = await _storeRepository.CountOrdersAsync(cancellationToken);
        var pendingSos = await _serviceRequestRepository.CountPendingAsync(cancellationToken);
        var openTickets = await _supportRepository.CountOpenTicketsAsync(cancellationToken);
        var revenue = await _storeRepository.SumPaidOrdersTotalAsync(cancellationToken);

        return Result<AdminDashboardSummaryDto>.Success(new AdminDashboardSummaryDto
        {
            TotalUsers = totalUsers,
            TotalOrders = totalOrders,
            PendingSosRequests = pendingSos,
            OpenTickets = openTickets,
            TotalRevenue = revenue
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
        var allUsers = _userManager.Users.AsNoTracking();
        var totalCount = await allUsers.CountAsync(cancellationToken);

        var users = await allUsers
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.FirstName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = users.Select(x => new AdminUserRowDto
        {
            Id = x.Id,
            FullName = $"{x.FirstName} {x.LastName}".Trim(),
            Email = x.Email ?? string.Empty,
            PhoneNumber = x.PhoneNumber ?? string.Empty,
            IsActive = x.IsActive,
            Points = x.Points
        }).ToList();

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
        var items = requests.Select(x => new AdminSosRowDto
        {
            RequestId = x.Id,
            ClientName = $"{x.Client.FirstName} {x.Client.LastName}".Trim(),
            ProviderName = x.Provider is null ? string.Empty : $"{x.Provider.FirstName} {x.Provider.LastName}".Trim(),
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
            .OrderByDescending(u => u.IsActive)
            .ThenBy(u => u.FirstName)
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
