using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.DTOs.Admin;
using SmartTrafficManagement.Application.DTOs.Seller;
using SmartTrafficManagement.Application.Features.Admin;
using SmartTrafficManagement.Application.Features.Seller;
using SmartTrafficManagement.Application.Features.Store.GetCategories;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize(Roles = AppRoles.Seller)]
public sealed class SellerController : BaseController
{
    // ── Category Management ──────────────────────────────────────────────────

    [HttpGet("categories")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCategories(
        [FromServices] GetAdminCategoriesQueryHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new GetAdminCategoriesQuery(), cancellationToken));

    [HttpPost("categories")]
    [ProducesResponseType(typeof(Result<CategoryDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult> CreateCategory(
        [FromBody] CreateCategoryRequestDto request,
        [FromServices] CreateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new CreateCategoryCommand(request.Name, request.Description), cancellationToken));

    [HttpPut("categories/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateCategory(
        Guid id,
        [FromBody] CreateCategoryRequestDto request,
        [FromServices] UpdateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new UpdateCategoryCommand(id, request.Name, request.Description), cancellationToken));

    [HttpDelete("categories/{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> DeleteCategory(
        Guid id,
        [FromServices] DeleteCategoryCommandHandler handler,
        CancellationToken cancellationToken)
        => ProcessResult(await handler.Handle(new DeleteCategoryCommand(id), cancellationToken));

    // ── Product Management ──────────────────────────────────────────────────


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
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(Result<SellerProductDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult> AddProduct(
        [FromForm] AddSellerProductDto request,
        [FromServices] AddMyProductCommandHandler handler,
        [FromServices] IFileStorageService storage,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;

        string? uploadedImageUrl = null;

        // If a file is provided → upload it and override any text ImageUrl
        if (request.Image is { Length: > 0 })
        {
            await using var stream = request.Image.OpenReadStream();
            uploadedImageUrl      = await storage.SaveAsync(stream, request.Image.FileName, "products", cancellationToken);
            request.ImageUrl      = uploadedImageUrl;   // file takes priority over text URL
        }

        var result = await handler.Handle(new AddMyProductCommand(sellerId, request), cancellationToken);

        // ── Rollback: delete the uploaded image if the product was NOT saved ──
        if (!result.IsSuccess && uploadedImageUrl is not null)
            await storage.DeleteAsync(uploadedImageUrl, cancellationToken);

        return ProcessResult(result);
    }

    [HttpPut("products/{id:guid}")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateProduct(
        Guid id,
        [FromForm] UpdateSellerProductDto request,
        [FromServices] UpdateMyProductCommandHandler handler,
        [FromServices] IFileStorageService storage,
        CancellationToken cancellationToken)
    {
        var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;

        string? uploadedImageUrl = null;

        // If a file is provided → upload it and override any text ImageUrl
        if (request.Image is { Length: > 0 })
        {
            await using var stream = request.Image.OpenReadStream();
            uploadedImageUrl      = await storage.SaveAsync(stream, request.Image.FileName, "products", cancellationToken);
            request.ImageUrl      = uploadedImageUrl;   // file takes priority over text URL
        }

        var result = await handler.Handle(new UpdateMyProductCommand(sellerId, id, request), cancellationToken);

        // ── Rollback: delete the uploaded image if the product update failed ──
        if (!result.IsSuccess && uploadedImageUrl is not null)
            await storage.DeleteAsync(uploadedImageUrl, cancellationToken);

        return ProcessResult(result);
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
