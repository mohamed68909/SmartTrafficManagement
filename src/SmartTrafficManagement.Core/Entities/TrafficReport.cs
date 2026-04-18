namespace SmartTrafficManagement.Core.Entities;

public sealed class TrafficReport : BaseEntity
{
    public string ReporterId { get; set; } = string.Empty;

    public Guid? VehicleId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public bool IsResolved { get; set; }

    public bool IsVerified { get; set; }

    public ApplicationUser Reporter { get; set; } = null!;

    public Vehicle? Vehicle { get; set; }
}
