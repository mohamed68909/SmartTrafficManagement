using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Seller;

public sealed class SellerProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}

public class AddSellerProductDto
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}

public sealed class UpdateSellerProductDto : AddSellerProductDto;

public sealed class SellerOrderDto
{
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Total { get; set; }
}

public sealed class UpdateSellerOrderStatusDto
{
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
}
