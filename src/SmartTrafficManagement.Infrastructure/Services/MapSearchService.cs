using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartTrafficManagement.Core.Interfaces;

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

    // ── Search (Geocoding) ────────────────────────────────────────────────────
    public async Task<IReadOnlyList<(string Name, double Lat, double Lng, string? PlaceId)>?> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("GoogleMaps:ApiKey is not configured.");
            return null;
        }

        try
        {
            var encodedQuery = Uri.EscapeDataString(query.Trim());
            var url = $"https://maps.googleapis.com/maps/api/geocode/json?address={encodedQuery}&key={_apiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var root   = doc.RootElement;
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
                var name     = result.GetProperty("formatted_address").GetString() ?? string.Empty;
                var location = result.GetProperty("geometry").GetProperty("location");
                var lat      = location.GetProperty("lat").GetDouble();
                var lng      = location.GetProperty("lng").GetDouble();
                var placeId  = result.TryGetProperty("place_id", out var pid) ? pid.GetString() : null;
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

    // ── Route (Directions) ────────────────────────────────────────────────────
    public async Task<RouteResultDto?> GetRouteAsync(
        double originLat, double originLng,
        double destLat,   double destLng,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("GoogleMaps:ApiKey is not configured — cannot calculate route.");
            return null;   // null = service not configured
        }

        try
        {
            var origin      = $"{originLat},{originLng}";
            var destination = $"{destLat},{destLng}";
            var url = $"https://maps.googleapis.com/maps/api/directions/json" +
                      $"?origin={origin}&destination={destination}" +
                      $"&mode=driving&language=ar&key={_apiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var root   = doc.RootElement;
            var status = root.GetProperty("status").GetString();

            if (status != "OK")
            {
                _logger.LogWarning("Google Directions API returned status: {Status}", status);
                return new RouteResultDto();   // empty (not null) = no route found
            }

            // Parse first route → first leg
            var route    = root.GetProperty("routes")[0];
            var leg      = route.GetProperty("legs")[0];
            var summary  = route.TryGetProperty("summary", out var s) ? s.GetString() ?? "" : "";
            var polyline = route.GetProperty("overview_polyline").GetProperty("points").GetString() ?? "";

            var distanceText  = leg.GetProperty("distance").GetProperty("text").GetString()  ?? "";
            var distanceVal   = leg.GetProperty("distance").GetProperty("value").GetInt32();
            var durationText  = leg.GetProperty("duration").GetProperty("text").GetString()  ?? "";
            var durationVal   = leg.GetProperty("duration").GetProperty("value").GetInt32();

            // Turn-by-turn steps
            var steps = new List<RouteStepDto>();
            foreach (var step in leg.GetProperty("steps").EnumerateArray())
            {
                var htmlInstr = step.GetProperty("html_instructions").GetString() ?? "";
                var plainInstr = StripHtml(htmlInstr);

                var startLoc = step.GetProperty("start_location");
                var endLoc   = step.GetProperty("end_location");

                steps.Add(new RouteStepDto
                {
                    Instruction = plainInstr,
                    Distance    = step.GetProperty("distance").GetProperty("text").GetString() ?? "",
                    Duration    = step.GetProperty("duration").GetProperty("text").GetString() ?? "",
                    StartLat    = startLoc.GetProperty("lat").GetDouble(),
                    StartLng    = startLoc.GetProperty("lng").GetDouble(),
                    EndLat      = endLoc.GetProperty("lat").GetDouble(),
                    EndLng      = endLoc.GetProperty("lng").GetDouble(),
                });
            }

            return new RouteResultDto
            {
                Summary         = summary,
                Distance        = distanceText,
                Duration        = durationText,
                DistanceMeters  = distanceVal,
                DurationSeconds = durationVal,
                EncodedPolyline = polyline,
                Steps           = steps
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Google Directions API: ({OLat},{OLng}) → ({DLat},{DLng})",
                originLat, originLng, destLat, destLng);
            return new RouteResultDto();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static string StripHtml(string html)
        => Regex.Replace(html, "<[^>]*>", " ").Replace("&nbsp;", " ").Trim();
}

