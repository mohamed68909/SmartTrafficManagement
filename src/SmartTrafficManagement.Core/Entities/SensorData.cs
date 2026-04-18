namespace SmartTrafficManagement.Core.Entities;

public sealed class SensorData : BaseEntity
{
    public Guid VehicleId { get; set; }

    public decimal TemperatureCelsius { get; set; }

    public decimal HumidityPercentage { get; set; }

    public decimal AirQualityIndex { get; set; }

    public DateTime CapturedAtUtc { get; set; } = DateTime.UtcNow;

    public Vehicle Vehicle { get; set; } = null!;
}
