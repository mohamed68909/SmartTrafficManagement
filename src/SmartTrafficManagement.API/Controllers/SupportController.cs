using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.DTOs.Cs;
using SmartTrafficManagement.Application.Features.Cs;
using SmartTrafficManagement.Application.Features.Support.GetMyTickets;
using SmartTrafficManagement.Application.Features.Support.CloseTicket;
using SmartTrafficManagement.Application.Features.Support.OpenTicket;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/support")]
[Authorize]
public sealed class SupportController : BaseController
{
    // ── Existing endpoints ──────────────────────────────────────────────────

    [HttpGet("tickets/my")]
   [Authorize(Roles = $"{AppRoles.Client},{AppRoles.Admin}")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<MyTicketDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMyTickets(
        [FromServices] GetMyTicketsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyTicketsQuery(userId), cancellationToken));
    }

    [HttpPost("tickets/open")]
    [Authorize(Roles = AppRoles.Client)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> OpenTicket(
        [FromBody] OpenTicketCommand command,
        [FromServices] OpenTicketCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.HandleAsync(userId, command, cancellationToken));
    }

    [HttpPatch("close/{id:guid}")]
    [Authorize(Roles = $"{AppRoles.Client},{AppRoles.Admin},{AppRoles.CSAgent}")]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> CloseTicket(
        Guid id,
        [FromServices] CloseTicketCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId    = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var isCsAgent = User.IsInRole(AppRoles.CSAgent) || User.IsInRole(AppRoles.Admin);
        return ProcessResult(await handler.HandleAsync(userId, isCsAgent, new CloseTicketCommand { TicketId = id }, cancellationToken));
    }

    // ── New endpoints ───────────────────────────────────────────────────────

    [HttpGet("tickets/stats")]
   [Authorize(Roles = $"{AppRoles.CSAgent},{AppRoles.Admin}")]
    [ProducesResponseType(typeof(Result<CsTicketStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetTicketStats(
        [FromServices] GetCsTicketStatsQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetCsTicketStatsQuery(), cancellationToken));

    [HttpGet("tickets/{id:guid}")]
   [Authorize(Roles = $"{AppRoles.CSAgent},{AppRoles.Admin}")]
    [ProducesResponseType(typeof(Result<CsTicketFullDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<CsTicketFullDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetTicketDetail(
        Guid id,
        [FromServices] GetCsTicketDetailQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetCsTicketDetailQuery(id), cancellationToken));

    [HttpPost("tickets/{id:guid}/escalate")]
   [Authorize(Roles = AppRoles.CSAgent)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> EscalateTicket(
        Guid id,
        [FromServices] EscalateTicketCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var agentId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new EscalateTicketCommand(agentId, id), cancellationToken));
    }
}
