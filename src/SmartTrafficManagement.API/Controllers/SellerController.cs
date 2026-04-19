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
    // ── Existing endpoints ──────────────────────────────────────────────────

    [HttpGet("products")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SellerProductDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetProducts(
        [FromServices] GetMyProductsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyProductsQuery(sellerId), cancellationToken));
    }

    [HttpPost("products")]
    [ProducesResponseType(typeof(Result<SellerProductDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult> AddProduct(
        [FromBody] AddSellerProductDto request,
        [FromServices] AddMyProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new AddMyProductCommand(sellerId, request), cancellationToken));
    }

    [HttpPut("products/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateProduct(
        Guid id,
        [FromBody] UpdateSellerProductDto request,
        [FromServices] UpdateMyProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateMyProductCommand(sellerId, id, request), cancellationToken));
    }

    [HttpDelete("products/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> DeleteProduct(
        Guid id,
        [FromServices] DeleteMyProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new DeleteMyProductCommand(sellerId, id), cancellationToken));
    }

    [HttpGet("orders")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SellerOrderDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetOrders(
        [FromServices] GetMyOrdersAsSellerQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetMyOrdersAsSellerQuery(sellerId), cancellationToken));
    }

    // ── New endpoints ───────────────────────────────────────────────────────

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(Result<SellerDashboardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetDashboard(
        [FromServices] GetSellerDashboardQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSellerDashboardQuery(sellerId), cancellationToken));
    }

    [HttpGet("orders/stats")]
    [ProducesResponseType(typeof(Result<SellerOrderStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetOrderStats(
        [FromServices] GetSellerOrderStatsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSellerOrderStatsQuery(sellerId), cancellationToken));
    }

    [HttpGet("analytics")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SellerAnalyticsMonthDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAnalytics(
        [FromServices] GetSellerAnalyticsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSellerAnalyticsQuery(sellerId), cancellationToken));
    }

    [HttpGet("store")]
    [ProducesResponseType(typeof(Result<SellerStoreProfileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetStore(
        [FromServices] GetSellerStoreProfileQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSellerStoreProfileQuery(sellerId), cancellationToken));
    }

    [HttpPut("store")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateStore(
        [FromBody] UpdateSellerStoreDto request,
        [FromServices] UpdateSellerStoreCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateSellerStoreCommand(sellerId, request), cancellationToken));
    }

    [HttpGet("reviews")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SellerReviewDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetReviews(
        [FromServices] GetSellerReviewsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSellerReviewsQuery(sellerId), cancellationToken));
    }

    [HttpGet("settings")]
    [ProducesResponseType(typeof(Result<SellerSettingsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetSettings(
        [FromServices] GetSellerSettingsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new GetSellerSettingsQuery(sellerId), cancellationToken));
    }

    [HttpPut("settings")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateSettings(
        [FromBody] UpdateSellerSettingsDto request,
        [FromServices] UpdateSellerSettingsCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new UpdateSellerSettingsCommand(sellerId, request), cancellationToken));
    }

    [HttpPost("orders/{id:guid}/prepare")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> PrepareOrder(
        Guid id,
        [FromServices] PrepareOrderCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new PrepareOrderCommand(sellerId, id), cancellationToken));
    }

    [HttpPost("products/{id:guid}/restock")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> RestockProduct(
        Guid id,
        [FromBody] RestockProductDto request,
        [FromServices] RestockProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        return ProcessResult(await handler.Handle(new RestockProductCommand(sellerId, id, request.Quantity), cancellationToken));
    }
}
