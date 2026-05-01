using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Sensors.Queries.GetLatestVehicleEnvironment;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/sensors")]
[Authorize]
public sealed class SensorsController : BaseController
{
    [HttpGet("vehicle-env")]
    [ProducesResponseType(typeof(Result<VehicleEnvironmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<VehicleEnvironmentDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetVehicleEnvironment(
        [FromQuery] Guid vehicleId,
        [FromServices] GetLatestVehicleEnvironmentQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new GetLatestVehicleEnvironmentQuery(vehicleId), cancellationToken);
        return ProcessResult(result);
    }
}
