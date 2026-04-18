namespace SmartTrafficManagement.Core.Interfaces;

/// <summary>
/// Represents weather data returned by the weather service.
/// Defined here in Core to avoid circular dependency with Application layer.
/// </summary>
public sealed record WeatherData(
    string City,
    string Country,
    double Temperature,
    double FeelsLike,
    double TempMin,
    double TempMax,
    int Humidity,
    double WindSpeed,
    string Description,
    string Icon,
    string IconUrl);

public interface IWeatherService
{
    /// <summary>Get current weather by lat/lng coordinates.</summary>
    Task<WeatherData?> GetByCoordinatesAsync(double lat, double lng, CancellationToken cancellationToken = default);

    /// <summary>Get current weather by city name.</summary>
    Task<WeatherData?> GetByCityAsync(string city, CancellationToken cancellationToken = default);
}

