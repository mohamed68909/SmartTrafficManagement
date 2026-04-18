namespace SmartTrafficManagement.Application.DTOs;

public sealed class VehicleEnvironmentDto
{
    public Guid VehicleId { get; set; }
    public decimal TemperatureCelsius { get; set; }
    public decimal HumidityPercentage { get; set; }
    public decimal AirQualityIndex { get; set; }
    public DateTime CapturedAtUtc { get; set; }
}
