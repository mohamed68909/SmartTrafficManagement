using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.DTOs.Admin;
using SmartTrafficManagement.Application.Features.Admin;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/admin")]
//[Authorize(Roles = AppRoles.Admin)]
public sealed class AdminController : BaseController
{
    [HttpGet("dashboard/summary")]
    [ProducesResponseType(typeof(Result<AdminDashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> DashboardSummary([FromServices] GetAdminDashboardSummaryQueryHandler handler, CancellationToken cancellationToken)
    {
        return ProcessResult(await handler.Handle(new GetAdminDashboardSummaryQuery(), cancellationToken));
    }

    [HttpGet("analytics/orders/monthly")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminMonthlyOrderStatsDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> MonthlyOrders([FromQuery] int months, [FromServices] GetMonthlyOrderAnalyticsQueryHandler handler, CancellationToken cancellationToken)
    {
        return ProcessResult(await handler.Handle(new GetMonthlyOrderAnalyticsQuery(months), cancellationToken));
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(Result<PagedResultDto<AdminUserRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Users(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromServices] GetAdminUsersQueryHandler handler,
        CancellationToken cancellationToken)
    {
        return ProcessResult(await handler.Handle(new GetAdminUsersQuery(pageNumber, pageSize), cancellationToken));
    }

    [HttpGet("tickets/recent")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminSupportTicketRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> RecentTickets([FromQuery] int limit, [FromServices] GetRecentSupportTicketsQueryHandler handler, CancellationToken cancellationToken)
    {
        return ProcessResult(await handler.Handle(new GetRecentSupportTicketsQuery(limit), cancellationToken));
    }

    [HttpGet("sos/recent")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminSosRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> RecentSos([FromQuery] int limit, [FromServices] GetRecentSosRequestsQueryHandler handler, CancellationToken cancellationToken)
    {
        return ProcessResult(await handler.Handle(new GetRecentSosRequestsQuery(limit), cancellationToken));
    }

    [HttpGet("providers")]
    [ProducesResponseType(typeof(Result<PagedResultDto<AdminProviderRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Providers(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromServices] GetAdminProvidersQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(
            new GetAdminProvidersQuery(pageNumber, pageSize),
            cancellationToken));
}
