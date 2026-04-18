using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class Order : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public decimal TotalAmount { get; set; }

    public string? PaymentIntentId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
