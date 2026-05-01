using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class ServiceRequest : BaseEntity
{
    public string ClientId { get; set; } = string.Empty;

    public string? ProviderId { get; set; }

    public Guid? VehicleId { get; set; }   // optional — users without registered vehicles can still request SOS

    public ServiceType ServiceType { get; set; }

    public RequestStatus Status { get; set; } = RequestStatus.Pending;

    public string Description { get; set; } = string.Empty;

    public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? ScheduledAtUtc { get; set; }

    public decimal EstimatedCost { get; set; }

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public ApplicationUser Client { get; set; } = null!;

    public ApplicationUser? Provider { get; set; }

    public Vehicle? Vehicle { get; set; }

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
