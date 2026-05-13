using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class Transaction : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public Guid? OrderId { get; set; }

    public Guid? ServiceRequestId { get; set; }

    public TransactionType Type { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public decimal Amount { get; set; }

    public string Currency { get; set; } = "egp";

    public string? StripePaymentIntentId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public Order? Order { get; set; }

    public ServiceRequest? ServiceRequest { get; set; }
}

