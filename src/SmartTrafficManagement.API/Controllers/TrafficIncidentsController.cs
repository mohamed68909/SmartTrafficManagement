using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Incidents.Queries.GetActiveTrafficIncidents;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Incidents.Queries.GetIncidentsByLocation;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class TrafficIncidentsController : BaseController
{
    [HttpGet]
    [ProducesResponseType(typeof(Result<IReadOnlyList<TrafficIncidentDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetActive(
        [FromServices] GetActiveTrafficIncidentsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new GetActiveTrafficIncidentsQuery(), cancellationToken);
        return ProcessResult(result);
    }

    [HttpGet("by-location")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<TrafficIncidentDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<IReadOnlyList<TrafficIncidentDto>>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> GetByLocation(
        [FromQuery] string location,
        [FromServices] GetIncidentsByLocationQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new GetIncidentsByLocationQuery(location), cancellationToken);
        return ProcessResult(result);
    }
}
