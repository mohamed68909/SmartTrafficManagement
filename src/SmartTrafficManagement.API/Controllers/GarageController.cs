using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Garage;
using SmartTrafficManagement.Application.Features.Garage.Commands;
using SmartTrafficManagement.Application.Features.Garage.Queries;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/garage")]
[Authorize(Roles = AppRoles.Client)]
public sealed class GarageController : BaseController
{
    [HttpGet]
    [ProducesResponseType(typeof(Result<IReadOnlyList<VehicleResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMyVehicles([FromServices] GetMyVehiclesQueryHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new GetMyVehiclesQuery(userId), cancellationToken);
        return ProcessResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<VehicleResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<VehicleResponseDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetById(Guid id, [FromServices] GetVehicleByIdQueryHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new GetVehicleByIdQuery(userId, id), cancellationToken);
        return ProcessResult(result);
    }

    [HttpPost]
    [HttpPost("add")]
    [ProducesResponseType(typeof(Result<VehicleResponseDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult> Add(
        [FromBody] AddVehicleRequestDto request,
        [FromServices] AddVehicleCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new AddVehicleCommand(userId, request), cancellationToken);
        return ProcessResult(result);
    }

    [HttpPut("{id:guid}")]
    [HttpPut("update/{id:guid}")]
    [ProducesResponseType(typeof(Result<VehicleResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Update(
        Guid id,
        [FromBody] UpdateVehicleRequestDto request,
        [FromServices] UpdateVehicleCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new UpdateVehicleCommand(userId, id, request), cancellationToken);
        return ProcessResult(result);
    }

    [HttpDelete("{id:guid}")]
    [HttpDelete("delete/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Delete(Guid id, [FromServices] DeleteVehicleCommandHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new DeleteVehicleCommand(userId, id), cancellationToken);
        return ProcessResult(result);
    }
}
