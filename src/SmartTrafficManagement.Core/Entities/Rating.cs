namespace SmartTrafficManagement.Core.Entities;

public sealed class Rating : BaseEntity
{
    /// <summary>ID of the user who submitted the rating.</summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Optional: ID of the service request being rated (SOS/Emergency).
    /// Null when rating a product/order.
    /// </summary>
    public Guid? ServiceRequestId { get; set; }

    /// <summary>
    /// Optional: ID of the order being rated.
    /// Null when rating a service request.
    /// </summary>
    public Guid? OrderId { get; set; }

    /// <summary>Rating value from 1 to 5.</summary>
    public int Stars { get; set; }

    /// <summary>Optional review comment.</summary>
    public string? Comment { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
    public ServiceRequest? ServiceRequest { get; set; }
    public Order? Order { get; set; }
}
