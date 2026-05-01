using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Reports.Commands.ReportTrafficIncident;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/traffic")]
[Authorize(Roles = AppRoles.Client)]
public sealed class TrafficController : BaseController
{
    [HttpPost("report")]
    [ProducesResponseType(typeof(Result<TrafficReportDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result<TrafficReportDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<TrafficReportDto>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Report(
        [FromBody] ReportTrafficIncidentCommand command,
        [FromServices] ReportTrafficIncidentCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        command.UserId = userId;
        var result = await handler.Handle(command, cancellationToken);
        return ProcessResult(result);
    }
}
