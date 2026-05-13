namespace SmartTrafficManagement.Application.DTOs;

public sealed class CheckoutDto
{
    public Guid OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "egp";
    public string PaymentIntentId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}

