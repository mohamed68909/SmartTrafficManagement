namespace SmartTrafficManagement.Core.Entities;

public sealed class RefreshToken : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresOnUtc { get; set; }

    public DateTime? RevokedOnUtc { get; set; }

    public bool IsActive => RevokedOnUtc is null && ExpiresOnUtc > DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
}
