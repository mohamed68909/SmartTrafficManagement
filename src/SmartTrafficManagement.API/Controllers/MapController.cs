using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Map;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/map")]
public sealed class MapController : BaseController
{
    /// <summary>
    /// Search for places / addresses in Egypt.
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<MapSearchResultDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<IReadOnlyList<MapSearchResultDto>>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<IReadOnlyList<MapSearchResultDto>>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult> Search(
        [FromQuery] string query,
        [FromServices] IMapSearchService mapSearchService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return ProcessResult(Result<IReadOnlyList<MapSearchResultDto>>.Failure(
                DomainErrors.Common.Validation("Query is required."),
                400));
        }

        var results = await mapSearchService.SearchAsync(query, cancellationToken);

        // null = API key not configured
        if (results is null)
            return ProcessResult(Result<IReadOnlyList<MapSearchResultDto>>.Failure(
                DomainErrors.Map.ServiceNotConfigured, 503));

        var response = results.Select(x => new MapSearchResultDto
        {
            Name    = x.Name,
            Lat     = x.Lat,
            Lng     = x.Lng,
            PlaceId = x.PlaceId
        }).ToList();

        return ProcessResult(Result<IReadOnlyList<MapSearchResultDto>>.Success(response, 200));
    }

    /// <summary>
    /// Calculate a driving route between two lat/lng points.
    /// Returns distance, duration, encoded polyline and turn-by-turn steps.
    /// </summary>
    /// <remarks>
    /// Query params: originLat, originLng, destLat, destLng (all required, double).
    ///
    /// Flutter usage:
    ///   GET /api/map/route?originLat=30.0444&amp;originLng=31.2357&amp;destLat=30.0626&amp;destLng=31.2497
    ///
    /// Response includes:
    /// - summary    : road name summary
    /// - distance   : human-readable ("12.5 km")
    /// - duration   : human-readable ("18 mins")
    /// - distanceMeters / durationSeconds : numeric values
    /// - encodedPolyline : Google encoded polyline for drawing on map
    /// - steps[]    : turn-by-turn navigation steps
    /// </remarks>
    [HttpGet("route")]
    [ProducesResponseType(typeof(Result<RouteResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<RouteResultDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<RouteResultDto>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult> GetRoute(
        [FromQuery] double originLat,
        [FromQuery] double originLng,
        [FromQuery] double destLat,
        [FromQuery] double destLng,
        [FromServices] IMapSearchService mapSearchService,
        CancellationToken cancellationToken)
    {
        // Basic coordinate validation
        if (originLat == 0 && originLng == 0)
            return ProcessResult(Result<RouteResultDto>.Failure(
                DomainErrors.Common.Validation("originLat and originLng are required."), 400));

        if (destLat == 0 && destLng == 0)
            return ProcessResult(Result<RouteResultDto>.Failure(
                DomainErrors.Common.Validation("destLat and destLng are required."), 400));

        var route = await mapSearchService.GetRouteAsync(originLat, originLng, destLat, destLng, cancellationToken);

        // null = Google Maps API key not configured
        if (route is null)
            return ProcessResult(Result<RouteResultDto>.Failure(
                DomainErrors.Map.ServiceNotConfigured, 503));

        return ProcessResult(Result<RouteResultDto>.Success(route, 200));
    }
}

