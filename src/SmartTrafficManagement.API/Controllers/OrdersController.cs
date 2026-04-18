using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Orders;
using SmartTrafficManagement.Application.Features.Orders;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/orders")]
//[Authorize]
public sealed class OrdersController : BaseController
{
    [HttpGet("my")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<OrderSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMine([FromServices] GetMyOrdersQueryHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyOrdersQuery(userId), cancellationToken));
    }

    [HttpGet("{orderId:guid}")]
    [ProducesResponseType(typeof(Result<OrderDetailsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetDetails(Guid orderId, [FromServices] GetOrderDetailsQueryHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetOrderDetailsQuery(userId, orderId), cancellationToken));
    }
}
