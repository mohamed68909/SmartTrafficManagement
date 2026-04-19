using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Provider;
using SmartTrafficManagement.Application.Features.Provider;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/provider")]
//[Authorize(Roles = AppRoles.Provider)]
public sealed class ProviderController : BaseController
{
    // ── Existing endpoints ──────────────────────────────────────────────────

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(Result<ProviderDashboardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Dashboard(
        [FromServices] GetProviderDashboardQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderDashboardQuery(userId), cancellationToken));
    }

    [HttpGet("jobs/history")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<ProviderHistoryItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> History(
        [FromServices] GetProviderHistoryQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderHistoryQuery(userId), cancellationToken));
    }

    [HttpGet("jobs/available")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<ProviderJobDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAvailableJobs(
        [FromServices] GetAvailableJobsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAvailableJobsQuery(), cancellationToken));

    [HttpPatch("jobs/accept/{requestId:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Accept(
        Guid requestId,
        [FromServices] AcceptJobCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new AcceptJobCommand(userId, requestId), cancellationToken));
    }

    [HttpPatch("jobs/status")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateStatus(
        [FromBody] UpdateProviderRequestStatusDto request,
        [FromServices] UpdateJobStatusCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateJobStatusCommand(userId, request), cancellationToken));
    }

    [HttpPatch("jobs/location")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateLocation(
        [FromBody] UpdateProviderLocationDto request,
        [FromServices] UpdateProviderLocationCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateProviderLocationCommand(userId, request), cancellationToken));
    }

    // ── New endpoints ───────────────────────────────────────────────────────

    [HttpGet("earnings")]
    [ProducesResponseType(typeof(Result<ProviderEarningsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetEarnings(
        [FromServices] GetProviderEarningsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderEarningsQuery(userId), cancellationToken));
    }

    [HttpGet("earnings/weekly")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<ProviderEarningsDayDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetEarningsWeekly(
        [FromServices] GetProviderEarningsWeeklyQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderEarningsWeeklyQuery(userId), cancellationToken));
    }

    [HttpGet("active-mission")]
    [ProducesResponseType(typeof(Result<ProviderActiveMissionDto?>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetActiveMission(
        [FromServices] GetProviderActiveMissionQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderActiveMissionQuery(userId), cancellationToken));
    }

    [HttpPost("active-mission/status")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateActiveMissionStatus(
        [FromBody] UpdateProviderRequestStatusDto request,
        [FromServices] UpdateJobStatusPostCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateJobStatusPostCommand(userId, request), cancellationToken));
    }

    [HttpGet("schedule")]
    [ProducesResponseType(typeof(Result<ProviderScheduleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetSchedule(
        [FromServices] GetProviderScheduleQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderScheduleQuery(userId), cancellationToken));
    }

    [HttpPut("schedule")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateSchedule(
        [FromBody] UpdateProviderScheduleDto request,
        [FromServices] UpdateProviderScheduleCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateProviderScheduleCommand(userId, request), cancellationToken));
    }

    [HttpPost("status")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ToggleOnline(
        [FromBody] ToggleProviderOnlineDto request,
        [FromServices] ToggleProviderOnlineCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new ToggleProviderOnlineCommand(userId, request.Online), cancellationToken));
    }

    [HttpGet("profile")]
    [ProducesResponseType(typeof(Result<ProviderProfileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetProfile(
        [FromServices] GetProviderProfileQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetProviderProfileQuery(userId), cancellationToken));
    }
}
