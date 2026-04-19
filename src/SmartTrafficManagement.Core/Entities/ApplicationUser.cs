using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public int Points { get; set; }

    public bool IsPremium { get; set; }

    public bool IsActive { get; set; } = true;

    public string? StripeCustomerId { get; set; }

    public string? ProfilePicture { get; set; }

    public string? Address { get; set; }

    /// <summary>Google's unique user ID (sub claim). Null for password-based accounts.</summary>
    public string? GoogleSubject { get; set; }

    /// <summary>OAuth provider name, e.g. "Google". Null for password-based accounts.</summary>
    public string? GoogleProviderName { get; set; }

    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiryUtc { get; set; }

    /// <summary>Approval status for Provider-role users. Null for other roles.</summary>
    public ProviderStatus? ProviderStatus { get; set; }

    /// <summary>Pipe-delimited list of document URLs uploaded by the provider for approval.</summary>
    public string? ProviderDocuments { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();

    public ICollection<ServiceRequest> ClientServiceRequests { get; set; } = new List<ServiceRequest>();

    public ICollection<ServiceRequest> ProviderServiceRequests { get; set; } = new List<ServiceRequest>();

    public ICollection<Order> Orders { get; set; } = new List<Order>();

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public ICollection<UserCard> UserCards { get; set; } = new List<UserCard>();

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public ICollection<TrafficReport> TrafficReports { get; set; } = new List<TrafficReport>();

    public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();

    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}
