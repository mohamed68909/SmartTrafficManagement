using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SmartTrafficManagement.Infrastructure.Services;

public sealed class WeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<WeatherService> _logger;

    private const string BaseUrl = "https://api.openweathermap.org/data/2.5/weather";

    public WeatherService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<WeatherService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("OpenWeather");
        _apiKey = configuration["OpenWeather:ApiKey"] ?? string.Empty;
        _logger = logger;
    }

    public async Task<WeatherData?> GetByCoordinatesAsync(double lat, double lng, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("OpenWeather:ApiKey is not configured.");
            return null;
        }

        var url = $"{BaseUrl}?lat={lat}&lon={lng}&units=metric&appid={_apiKey}";
        return await FetchWeatherAsync(url, cancellationToken);
    }

    public async Task<WeatherData?> GetByCityAsync(string city, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("OpenWeather:ApiKey is not configured.");
            return null;
        }

        var encodedCity = Uri.EscapeDataString(city.Trim());
        var url = $"{BaseUrl}?q={encodedCity}&units=metric&appid={_apiKey}";
        return await FetchWeatherAsync(url, cancellationToken);
    }

    private async Task<WeatherData?> FetchWeatherAsync(string url, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenWeather API returned status: {Status}", response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var weather     = root.GetProperty("weather")[0];
            var main        = root.GetProperty("main");
            var wind        = root.GetProperty("wind");
            var cityName    = root.GetProperty("name").GetString() ?? string.Empty;
            var countryCode = root.GetProperty("sys").GetProperty("country").GetString() ?? string.Empty;
            var icon        = weather.GetProperty("icon").GetString() ?? string.Empty;

            return new WeatherData(
                City:        cityName,
                Country:     countryCode,
                Temperature: main.GetProperty("temp").GetDouble(),
                FeelsLike:   main.GetProperty("feels_like").GetDouble(),
                TempMin:     main.GetProperty("temp_min").GetDouble(),
                TempMax:     main.GetProperty("temp_max").GetDouble(),
                Humidity:    main.GetProperty("humidity").GetInt32(),
                WindSpeed:   wind.GetProperty("speed").GetDouble(),
                Description: weather.GetProperty("description").GetString() ?? string.Empty,
                Icon:        icon,
                IconUrl:     $"https://openweathermap.org/img/wn/{icon}@2x.png");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenWeather API. URL: {Url}", url);
            return null;
        }
    }
}

