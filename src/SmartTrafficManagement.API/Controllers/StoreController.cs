using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Store.AddToCart;
using SmartTrafficManagement.Application.Features.Store.Checkout;
using SmartTrafficManagement.Application.Features.Store.GetCart;
using SmartTrafficManagement.Application.Features.Store.GetProducts;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/store")]
//[Authorize]
public sealed class StoreController : BaseController
{
    [HttpGet("products")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Result<PagedResultDto<ProductDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<PagedResultDto<ProductDto>>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> GetProducts(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromServices] GetProductsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var query = new GetProductsQuery
        {
            PageNumber = pageNumber <= 0 ? 1 : pageNumber,
            PageSize   = pageSize   <= 0 ? 10 : pageSize,
            Search     = search,
            CategoryId = categoryId
        };

        var result = await handler.HandleAsync(query, cancellationToken);
        return ProcessResult(result);
    }

    [HttpPost("checkout")]
    //[Authorize]
    [ProducesResponseType(typeof(Result<CheckoutDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<CheckoutDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Checkout(
        [FromBody] CheckoutCommand command,
        [FromServices] CheckoutCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.HandleAsync(userId, command, cancellationToken);
        return ProcessResult(result);
    }
}

