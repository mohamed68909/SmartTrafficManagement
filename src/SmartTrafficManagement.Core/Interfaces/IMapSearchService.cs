namespace SmartTrafficManagement.Core.Interfaces;

public interface IMapSearchService
{
    /// <summary>Returns null when API key is not configured, empty list for zero results.</summary>
    Task<IReadOnlyList<(string Name, double Lat, double Lng, string? PlaceId)>?> SearchAsync(string query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates a driving route between two lat/lng points.
    /// Returns null when the API key is not configured.
    /// </summary>
    Task<RouteResultDto?> GetRouteAsync(double originLat, double originLng, double destLat, double destLng, CancellationToken cancellationToken = default);
}

/// <summary>Result of a route calculation.</summary>
public sealed class RouteResultDto
{
    public string Summary        { get; set; } = string.Empty;   // road names summary
    public string Distance       { get; set; } = string.Empty;   // e.g. "12.5 km"
    public string Duration       { get; set; } = string.Empty;   // e.g. "18 mins"
    public int    DistanceMeters { get; set; }
    public int    DurationSeconds{ get; set; }
    public string EncodedPolyline{ get; set; } = string.Empty;   // for drawing on map
    public IReadOnlyList<RouteStepDto> Steps { get; set; } = [];
}

/// <summary>A single turn-by-turn navigation step.</summary>
public sealed class RouteStepDto
{
    public string Instruction    { get; set; } = string.Empty;   // HTML stripped
    public string Distance       { get; set; } = string.Empty;
    public string Duration       { get; set; } = string.Empty;
    public double StartLat       { get; set; }
    public double StartLng       { get; set; }
    public double EndLat         { get; set; }
    public double EndLng         { get; set; }
}

