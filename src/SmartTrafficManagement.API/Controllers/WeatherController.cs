using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Weather;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/weather")]
public sealed class WeatherController : BaseController
{
    /// <summary>
    /// Get current weather by GPS coordinates (latitude / longitude).
    /// Used by the mobile "weather" screen — pass the device location.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<WeatherResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<WeatherResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<WeatherResponseDto>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult> GetByCoordinates(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromServices] IWeatherService weatherService,
        CancellationToken cancellationToken)
    {
        if (lat is < -90 or > 90 || lng is < -180 or > 180)
        {
            return ProcessResult(Result<WeatherResponseDto>.Failure(
                DomainErrors.Common.Validation("Invalid latitude or longitude values."), 400));
        }

        var data = await weatherService.GetByCoordinatesAsync(lat, lng, cancellationToken);
        if (data is null)
            return ProcessResult(Result<WeatherResponseDto>.Failure(DomainErrors.Weather.FetchFailed, 503));

        return ProcessResult(Result<WeatherResponseDto>.Success(Map(data), 200));
    }

    /// <summary>
    /// Get current weather by city name.
    /// Example: GET /api/weather/city?name=Cairo
    /// </summary>
    [HttpGet("city")]
    [ProducesResponseType(typeof(Result<WeatherResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<WeatherResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<WeatherResponseDto>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult> GetByCity(
        [FromQuery] string name,
        [FromServices] IWeatherService weatherService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return ProcessResult(Result<WeatherResponseDto>.Failure(
                DomainErrors.Common.Validation("City name is required."), 400));
        }

        var data = await weatherService.GetByCityAsync(name, cancellationToken);
        if (data is null)
            return ProcessResult(Result<WeatherResponseDto>.Failure(DomainErrors.Weather.FetchFailed, 503));

        return ProcessResult(Result<WeatherResponseDto>.Success(Map(data), 200));
    }

    private static WeatherResponseDto Map(WeatherData d) => new()
    {
        City        = d.City,
        Country     = d.Country,
        Temperature = d.Temperature,
        FeelsLike   = d.FeelsLike,
        TempMin     = d.TempMin,
        TempMax     = d.TempMax,
        Humidity    = d.Humidity,
        WindSpeed   = d.WindSpeed,
        Description = d.Description,
        Icon        = d.Icon,
        IconUrl     = d.IconUrl
    };
}

