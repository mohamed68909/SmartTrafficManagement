namespace SmartTrafficManagement.Application.DTOs.Map;

public sealed class MapSearchResultDto
{
    public string Name    { get; set; } = string.Empty;
    public double Lat     { get; set; }
    public double Lng     { get; set; }
    public string? PlaceId { get; set; }
}
