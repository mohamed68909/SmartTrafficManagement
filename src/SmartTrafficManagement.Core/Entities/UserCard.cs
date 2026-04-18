namespace SmartTrafficManagement.Core.Entities;

public sealed class UserCard : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public string HolderName { get; set; } = string.Empty;

    public string Last4 { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public int ExpMonth { get; set; }

    public int ExpYear { get; set; }

    public string StripePaymentMethodId { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public ApplicationUser User { get; set; } = null!;
}
