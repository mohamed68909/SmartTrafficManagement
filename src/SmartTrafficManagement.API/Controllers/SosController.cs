using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Sos;
using SmartTrafficManagement.Application.Features.Sos.AcceptSos;
using SmartTrafficManagement.Application.Features.Sos.GetSosStatus;
using SmartTrafficManagement.Application.Features.Sos.RequestSos;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/sos")]
//[Authorize]
public sealed class SosController : BaseController
{
    [HttpGet("history")]
    [Authorize(Roles = AppRoles.Client)]
    [ProducesResponseType(typeof(Result<IReadOnlyList<RequestDetailsDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> History([FromServices] GetSosHistoryQueryHandler handler, CancellationToken cancellationToken)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSosHistoryQuery(clientId), cancellationToken));
    }

    [HttpPatch("cancel/{id:guid}")]
    [Authorize(Roles = AppRoles.Client)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Cancel(Guid id, [FromServices] CancelSosCommandHandler handler, CancellationToken cancellationToken)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new CancelSosCommand(clientId, id), cancellationToken));
    }

    [HttpPost("request")]
    [Authorize(Roles = AppRoles.Client)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult> RequestSos(
        [FromBody] RequestSosCommand command,
        [FromServices] RequestSosCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.HandleAsync(clientId, command, cancellationToken);
        return ProcessResult(result);
    }

    [HttpPatch("accept/{id:guid}")]
    [Authorize(Roles = AppRoles.Provider)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(Result<RequestDetailsDto>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult> AcceptSos(
        Guid id,
        [FromServices] AcceptSosCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var providerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var command = new AcceptSosCommand { RequestId = id };
        var result = await handler.HandleAsync(providerId, command, cancellationToken);
        return ProcessResult(result);
    }

    [HttpGet("status/{id:guid}")]
    [ProducesResponseType(typeof(Result<SosStatusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<SosStatusDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetStatus(
        Guid id,
        [FromServices] GetSosStatusQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var query = new GetSosStatusQuery { RequestId = id };
        var result = await handler.HandleAsync(query, cancellationToken);
        return ProcessResult(result);
    }
}
