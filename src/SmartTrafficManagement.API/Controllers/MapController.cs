using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Map;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
//[Authorize]
[Route("api/map")]
public sealed class MapController : BaseController
{
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
}
