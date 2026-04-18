using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SmartTrafficManagement.Infrastructure.Services;

public sealed class MapSearchService : IMapSearchService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<MapSearchService> _logger;

    public MapSearchService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<MapSearchService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("GoogleMaps");
        _apiKey = configuration["GoogleMaps:ApiKey"] ?? string.Empty;
        _logger = logger;
    }

    public async Task<IReadOnlyList<(string Name, double Lat, double Lng, string? PlaceId)>?> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("GoogleMaps:ApiKey is not configured.");
            return null;   // null = not configured, distinct from empty results
        }

        try
        {
            var encodedQuery = Uri.EscapeDataString(query.Trim());
            var url = $"https://maps.googleapis.com/maps/api/geocode/json?address={encodedQuery}&key={_apiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var root = doc.RootElement;
            var status = root.GetProperty("status").GetString();

            if (status != "OK" && status != "ZERO_RESULTS")
            {
                _logger.LogWarning("Google Geocoding API returned status: {Status}", status);
                return Array.Empty<(string, double, double, string?)>();
            }

            if (!root.TryGetProperty("results", out var results))
                return Array.Empty<(string, double, double, string?)>();

            var list = new List<(string Name, double Lat, double Lng, string? PlaceId)>();
            foreach (var result in results.EnumerateArray().Take(10))
            {
                var name = result.GetProperty("formatted_address").GetString() ?? string.Empty;
                var location = result.GetProperty("geometry").GetProperty("location");
                var lat = location.GetProperty("lat").GetDouble();
                var lng = location.GetProperty("lng").GetDouble();
                var placeId = result.TryGetProperty("place_id", out var pid)
                    ? pid.GetString() : null;
                list.Add((name, lat, lng, placeId));
            }

            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Google Geocoding API for query: {Query}", query);
            return Array.Empty<(string, double, double, string?)>();
        }
    }
}
