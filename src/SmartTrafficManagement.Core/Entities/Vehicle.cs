using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Core.Entities;

public sealed class Vehicle : BaseEntity
{
    public string OwnerId { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;

    // Kept for backward compatibility with existing usage.
    public string PlateNumber { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public string Color { get; set; } = string.Empty;

    public string? RegistrationPhotoUrl { get; set; }

    public VehicleType Type { get; set; }

    public bool IsDefault { get; set; }

    public bool IsDeleted { get; set; }

    public ApplicationUser Owner { get; set; } = null!;

    public ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();

    public ICollection<SensorData> SensorDataRecords { get; set; } = new List<SensorData>();
}
