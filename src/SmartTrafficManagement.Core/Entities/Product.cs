namespace SmartTrafficManagement.Core.Entities;

public sealed class Product : BaseEntity
{
    public string SellerId { get; set; } = string.Empty;

    public Guid CategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public Category Category { get; set; } = null!;

    public ApplicationUser Seller { get; set; } = null!;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
