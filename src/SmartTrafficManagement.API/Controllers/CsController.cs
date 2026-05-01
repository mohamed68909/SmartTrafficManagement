using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Cs;
using SmartTrafficManagement.Application.Features.Cs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/cs")]
[Authorize(Roles = AppRoles.CSAgent)]
public sealed class CsController : BaseController
{
    [HttpGet("drivers/search")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<CsDriverDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> SearchDrivers(
        [FromQuery] string q,
        [FromServices] SearchDriversQueryHandler handler,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q))
            return ProcessResult(Result<IReadOnlyList<CsDriverDto>>.Success([], 200));

        return ProcessResult(await handler.Handle(new SearchDriversQuery(q), cancellationToken));
    }

    [HttpGet("drivers/{id}")]
    [ProducesResponseType(typeof(Result<CsDriverContextDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<CsDriverContextDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetDriverContext(
        string id,
        [FromServices] GetDriverContextQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetDriverContextQuery(id), cancellationToken));

    [HttpPost("drivers/{id}/block")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> BlockDriver(
        string id,
        [FromServices] BlockDriverCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new BlockDriverCommand(id), cancellationToken));

    [HttpPost("agent/status")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> SetAgentStatus(
        [FromBody] ToggleCsAgentOnlineDto request,
        [FromServices] ToggleCsAgentOnlineCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var agentId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new ToggleCsAgentOnlineCommand(agentId, request.Online), cancellationToken));
    }
}
