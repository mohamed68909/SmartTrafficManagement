namespace SmartTrafficManagement.Core.Interfaces;

/// <summary>
/// Represents a road-side / IoT sensor (not vehicle SensorData).
/// Returns an empty collection until a real sensor table is added.
/// </summary>
public interface ISensorRepository
{
    Task<IReadOnlyList<SensorRow>> GetAllAsync(CancellationToken cancellationToken = default);
}

/// <summary>Lightweight read model for a sensor, used only by admin queries.</summary>
public sealed class SensorRow
{
    public Guid     Id           { get; set; }
    public string   Name         { get; set; } = string.Empty;
    public double   Latitude     { get; set; }
    public double   Longitude    { get; set; }
    public SensorStatus Status   { get; set; }
    public double   CurrentValue { get; set; }
    public string   Unit         { get; set; } = string.Empty;
    public DateTime UpdatedAt    { get; set; }
}

public enum SensorStatus { Active, Inactive, Error }
