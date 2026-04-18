namespace SmartTrafficManagement.Application.DTOs.Payments;

public sealed class AddPaymentCardRequestDto
{
    public string PaymentMethodId { get; set; } = string.Empty;
}

public sealed class SavedCardDto
{
    public string PaymentMethodId { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }
    public bool IsDefault { get; set; }
}

public sealed class PaymentHistoryItemDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public sealed class RefundPaymentRequestDto
{
    public string PaymentIntentId { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
}

public sealed class RefundPaymentResponseDto
{
    public string RefundId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
}

public sealed class StripeConfigDto
{
    public string PublishableKey { get; set; } = string.Empty;
}
