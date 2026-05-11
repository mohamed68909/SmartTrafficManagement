using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Cart;
using SmartTrafficManagement.Application.Features.Store.AddToCart;
using SmartTrafficManagement.Application.Features.Store.GetCart;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public sealed class CartController : BaseController
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(Result<CartDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Get([FromServices] GetCartQueryHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.HandleAsync(userId, cancellationToken));
    }

    [HttpPost("items")]
    [Authorize]
    [ProducesResponseType(typeof(Result<CartDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> AddItem([FromBody] AddToCartCommand command, [FromServices] AddToCartCommandHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.HandleAsync(userId, command, cancellationToken));
    }

    public sealed class UpdateCartQuantityRequest
    {
        public int Quantity { get; set; }
    }

    [HttpPatch("items/{cartItemId:guid}")]
    [ProducesResponseType(typeof(Result<CartDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateQuantity(Guid cartItemId, [FromBody] UpdateCartQuantityRequest request, [FromServices] UpdateCartQuantityCommandHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateCartQuantityCommand(userId, cartItemId, request.Quantity), cancellationToken));
    }

    [HttpDelete("items/{cartItemId:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Remove(Guid cartItemId, [FromServices] RemoveCartItemCommandHandler handler, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new RemoveCartItemCommand(userId, cartItemId), cancellationToken));
    }
}
