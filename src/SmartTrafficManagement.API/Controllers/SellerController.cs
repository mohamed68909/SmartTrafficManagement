using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Seller;
using SmartTrafficManagement.Application.Features.Seller;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/seller")]
//[Authorize(Roles = AppRoles.Seller)]
public sealed class SellerController : BaseController
{
    [HttpGet("products")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SellerProductDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetProducts([FromServices] GetMyProductsQueryHandler handler, CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyProductsQuery(sellerId), cancellationToken));
    }

    [HttpPost("products")]
    [ProducesResponseType(typeof(Result<SellerProductDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult> AddProduct([FromBody] AddSellerProductDto request, [FromServices] AddMyProductCommandHandler handler, CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new AddMyProductCommand(sellerId, request), cancellationToken));
    }

    [HttpPut("products/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateProduct(Guid id, [FromBody] UpdateSellerProductDto request, [FromServices] UpdateMyProductCommandHandler handler, CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateMyProductCommand(sellerId, id, request), cancellationToken));
    }

    [HttpDelete("products/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> DeleteProduct(Guid id, [FromServices] DeleteMyProductCommandHandler handler, CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new DeleteMyProductCommand(sellerId, id), cancellationToken));
    }

    [HttpGet("orders")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SellerOrderDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetOrders([FromServices] GetMyOrdersAsSellerQueryHandler handler, CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyOrdersAsSellerQuery(sellerId), cancellationToken));
    }
}
