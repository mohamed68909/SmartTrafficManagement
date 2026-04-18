namespace SmartTrafficManagement.Application.DTOs;

public sealed class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}
