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
    // ── Existing endpoints ──────────────────────────────────────────────────

    [HttpGet("dashboard/summary")]
    [ProducesResponseType(typeof(Result<AdminDashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> DashboardSummary(
        [FromServices] GetAdminDashboardSummaryQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminDashboardSummaryQuery(), cancellationToken));

    [HttpGet("analytics/orders/monthly")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminMonthlyOrderStatsDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> MonthlyOrders(
        [FromQuery] int months,
        [FromServices] GetMonthlyOrderAnalyticsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetMonthlyOrderAnalyticsQuery(months), cancellationToken));

    [HttpGet("users")]
    [ProducesResponseType(typeof(Result<PagedResultDto<AdminUserRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Users(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromServices] GetAdminUsersQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminUsersQuery(pageNumber, pageSize), cancellationToken));

    [HttpGet("tickets/recent")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminSupportTicketRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> RecentTickets(
        [FromQuery] int limit,
        [FromServices] GetRecentSupportTicketsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetRecentSupportTicketsQuery(limit), cancellationToken));

    [HttpGet("sos/recent")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminSosRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> RecentSos(
        [FromQuery] int limit,
        [FromServices] GetRecentSosRequestsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetRecentSosRequestsQuery(limit), cancellationToken));

    [HttpGet("providers")]
    [ProducesResponseType(typeof(Result<PagedResultDto<AdminProviderRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Providers(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromServices] GetAdminProvidersQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminProvidersQuery(pageNumber, pageSize), cancellationToken));

    // ── New endpoints ───────────────────────────────────────────────────────

    [HttpGet("cs-agents")]
    [ProducesResponseType(typeof(Result<PagedResultDto<AdminCsAgentRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCsAgents(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromServices] GetAdminCsAgentsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminCsAgentsQuery(pageNumber, pageSize), cancellationToken));

    [HttpPost("cs-agents")]
    [ProducesResponseType(typeof(Result<AdminCsAgentRowDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult> CreateCsAgent(
        [FromBody] CreateCsAgentDto request,
        [FromServices] CreateCsAgentCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new CreateCsAgentCommand(request), cancellationToken));

    [HttpPost("cs-agents/{id}/activate")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ActivateCsAgent(
        string id,
        [FromServices] ToggleCsAgentActiveCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new ToggleCsAgentActiveCommand(id), cancellationToken));

    [HttpGet("tickets/stats")]
    [ProducesResponseType(typeof(Result<AdminTicketStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> TicketStats(
        [FromServices] GetAdminTicketStatsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminTicketStatsQuery(), cancellationToken));

    [HttpGet("tickets/{id:guid}")]
    [ProducesResponseType(typeof(Result<AdminTicketDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> TicketDetail(
        Guid id,
        [FromServices] GetAdminTicketDetailQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminTicketDetailQuery(id), cancellationToken));

    [HttpGet("users/{id}")]
    [ProducesResponseType(typeof(Result<AdminUserDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UserDetail(
        string id,
        [FromServices] GetAdminUserDetailQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminUserDetailQuery(id), cancellationToken));

    [HttpPut("users/{id}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateUser(
        string id,
        [FromBody] UpdateAdminUserDto request,
        [FromServices] UpdateAdminUserCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new UpdateAdminUserCommand(id, request), cancellationToken));

    [HttpGet("ratings")]
    [ProducesResponseType(typeof(Result<PagedResultDto<AdminRatingDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Ratings(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromServices] GetAdminRatingsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminRatingsQuery(pageNumber, pageSize), cancellationToken));

    [HttpGet("system-status")]
    [ProducesResponseType(typeof(Result<AdminSystemStatusDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> SystemStatus(
        [FromServices] GetAdminSystemStatusQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminSystemStatusQuery(), cancellationToken));

    [HttpGet("activity")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminActivityDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Activity(
        [FromServices] GetAdminActivityQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminActivityQuery(), cancellationToken));

    // ── Urgent / SOS ────────────────────────────────────────────────────────

    [HttpGet("urgent")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminUrgentSosDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetUrgent(
        [FromServices] GetAdminUrgentQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminUrgentQuery(), cancellationToken));

    [HttpPost("urgent/{id:guid}/assign")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> AssignSos(
        Guid id,
        [FromBody] AssignSosDto request,
        [FromServices] AssignSosCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new AssignSosCommand(id, request), cancellationToken));

    [HttpGet("urgent/{id:guid}/track")]
    [ProducesResponseType(typeof(Result<AdminSosTrackDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> TrackSos(
        Guid id,
        [FromServices] TrackSosQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new TrackSosQuery(id), cancellationToken));

    // ── Provider Approvals ──────────────────────────────────────────────────

    [HttpGet("approvals")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<AdminApprovalRowDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetApprovals(
        [FromServices] GetAdminApprovalsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminApprovalsQuery(), cancellationToken));

    [HttpGet("approvals/stats")]
    [ProducesResponseType(typeof(Result<AdminApprovalStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetApprovalStats(
        [FromServices] GetAdminApprovalStatsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminApprovalStatsQuery(), cancellationToken));

    [HttpGet("approvals/{id}/docs")]
    [ProducesResponseType(typeof(Result<AdminProviderDocsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetProviderDocs(
        string id,
        [FromServices] GetProviderDocsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetProviderDocsQuery(id), cancellationToken));

    [HttpPost("approvals/{id}/approve")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ApproveProvider(
        string id,
        [FromServices] ApproveProviderCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new ApproveProviderCommand(id), cancellationToken));

    [HttpPost("approvals/{id}/reject")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> RejectProvider(
        string id,
        [FromBody] RejectProviderDto request,
        [FromServices] RejectProviderCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new RejectProviderCommand(id, request.Reason), cancellationToken));
}
