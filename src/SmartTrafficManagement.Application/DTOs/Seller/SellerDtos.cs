using Microsoft.AspNetCore.Http;
using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Seller;

public sealed class SellerProductDto
{
    public Guid    Id            { get; set; }
    public string  Name          { get; set; } = string.Empty;
    public string? Description   { get; set; }
    public decimal Price         { get; set; }
    public int     StockQuantity { get; set; }
    public string? ImageUrl      { get; set; }
    public Guid    CategoryId    { get; set; }
}

/// <summary>
/// Used for POST /api/seller/products — accepts multipart/form-data so the seller
/// can upload a product image directly from their device in the same request.
/// </summary>
public class AddSellerProductDto
{
    public Guid    CategoryId    { get; set; }
    public string  Name          { get; set; } = string.Empty;
    public string? Description   { get; set; }
    public decimal Price         { get; set; }
    public int     StockQuantity { get; set; }

    /// <summary>Optional image file uploaded from the device (jpg/png/webp, max 15 MB).</summary>
    public IFormFile? Image { get; set; }

    /// <summary>Fallback: provide an existing URL if no file is uploaded.</summary>
    public string? ImageUrl { get; set; }
}

/// <summary>
/// Used for PUT /api/seller/products/{id} — same multipart/form-data support.
/// </summary>
public sealed class UpdateSellerProductDto : AddSellerProductDto;

public sealed class SellerOrderDto
{
    public Guid        OrderId { get; set; }
    public OrderStatus Status  { get; set; }
    public decimal     Total   { get; set; }
}

public sealed class UpdateSellerOrderStatusDto
{
    public Guid        OrderId { get; set; }
    public OrderStatus Status  { get; set; }
}

// ── New DTOs ──

public sealed class SellerDashboardDto
{
    public int                            TotalProducts { get; set; }
    public int                            TotalOrders   { get; set; }
    public decimal                        TotalRevenue  { get; set; }
    public int                            PendingOrders { get; set; }
    public IReadOnlyList<SellerOrderDto>  RecentOrders  { get; set; } = [];
}

public sealed class SellerOrderStatsDto
{
    public int Pending    { get; set; }
    public int Processing { get; set; }
    public int Completed  { get; set; }
    public int Cancelled  { get; set; }
}

public sealed class SellerAnalyticsMonthDto
{
    public string  Month   { get; set; } = string.Empty; // e.g. "Jan 2025"
    public decimal Revenue { get; set; }
    public int     Orders  { get; set; }
}

public sealed class SellerStoreProfileDto
{
    public string  Name        { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Logo        { get; set; }
    public double  Rating      { get; set; }
    public int     TotalSales  { get; set; }
}

public sealed class UpdateSellerStoreDto
{
    public string  Name        { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Logo        { get; set; }
}

public sealed class SellerReviewDto
{
    public Guid     Id           { get; set; }
    public string   CustomerName { get; set; } = string.Empty;
    public int      Stars        { get; set; }
    public string?  Comment      { get; set; }
    public DateTime Date         { get; set; }
    public string   ProductName  { get; set; } = string.Empty;
}

public sealed class SellerSettingsDto
{
    public bool EmailNotifications { get; set; }
    public bool SmsNotifications   { get; set; }
    public bool AutoAcceptOrders   { get; set; }
}

public sealed class UpdateSellerSettingsDto
{
    public bool EmailNotifications { get; set; }
    public bool SmsNotifications   { get; set; }
    public bool AutoAcceptOrders   { get; set; }
}

public sealed class RestockProductDto
{
    public int Quantity { get; set; }
}
