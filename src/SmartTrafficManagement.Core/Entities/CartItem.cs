namespace SmartTrafficManagement.Core.Entities;

public sealed class CartItem : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public Product Product { get; set; } = null!;
}
