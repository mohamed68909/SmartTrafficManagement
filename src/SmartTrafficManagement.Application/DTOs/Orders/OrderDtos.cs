using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs.Orders;

public class OrderSummaryDto
{
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class OrderDetailsDto : OrderSummaryDto
{
    public IReadOnlyList<OrderItemLineDto> Items { get; set; } = Array.Empty<OrderItemLineDto>();
}

public sealed class OrderItemLineDto
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
