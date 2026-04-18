namespace SmartTrafficManagement.Core.Interfaces;

public interface IMapSearchService
{
    /// <summary>Returns null when API key is not configured, empty list for zero results.</summary>
    Task<IReadOnlyList<(string Name, double Lat, double Lng, string? PlaceId)>?> SearchAsync(string query, CancellationToken cancellationToken = default);
}
