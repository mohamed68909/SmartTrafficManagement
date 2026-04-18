using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Support.GetMyTickets;
using SmartTrafficManagement.Application.Features.Support.CloseTicket;
using SmartTrafficManagement.Application.Features.Support.OpenTicket;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/support")]
//[Authorize]
public sealed class SupportController : BaseController
{
    [HttpGet("tickets/my")]
    //[Authorize(Roles = $"{AppRoles.Client},{AppRoles.Admin}")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<MyTicketDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMyTickets([FromServices] GetMyTicketsQueryHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyTicketsQuery(userId), cancellationToken));
    }

    [HttpPost("tickets/open")]
    //[Authorize(Roles = AppRoles.Client)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> OpenTicket(
        [FromBody] OpenTicketCommand command,
        [FromServices] OpenTicketCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.HandleAsync(userId, command, cancellationToken);
        return ProcessResult(result);
    }

    [HttpPatch("close/{id:guid}")]
   // [Authorize(Roles = $"{AppRoles.Client},{AppRoles.Admin},{AppRoles.CSAgent}")]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Result<SupportTicketDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> CloseTicket(
        Guid id,
        [FromServices] CloseTicketCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var isCsAgent = User.IsInRole(AppRoles.CSAgent) || User.IsInRole(AppRoles.Admin);
        var result = await handler.HandleAsync(userId, isCsAgent, new CloseTicketCommand { TicketId = id }, cancellationToken);
        return ProcessResult(result);
    }
}
