using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.TrafficIntelligence.GetVehicleEnvironment;

public sealed class GetVehicleEnvironmentQuery
{
    public Guid VehicleId { get; set; }
}

public sealed class GetVehicleEnvironmentQueryValidator : AbstractValidator<GetVehicleEnvironmentQuery>
{
    public GetVehicleEnvironmentQueryValidator()
    {
        RuleFor(x => x.VehicleId).NotEmpty();
    }
}

public sealed class GetVehicleEnvironmentQueryHandler
{
    private readonly ITrafficIntelligenceRepository _repository;
    private readonly IValidator<GetVehicleEnvironmentQuery> _validator;

    public GetVehicleEnvironmentQueryHandler(
        ITrafficIntelligenceRepository repository,
        IValidator<GetVehicleEnvironmentQuery> validator)
    {
        _repository = repository;
        _validator = validator;
    }

    public async Task<Result<VehicleEnvironmentDto>> HandleAsync(
        GetVehicleEnvironmentQuery query,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<VehicleEnvironmentDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var sensor = await _repository.GetLatestSensorDataByVehicleIdAsync(query.VehicleId, cancellationToken);
        if (sensor is null)
        {
            return Result<VehicleEnvironmentDto>.Failure(DomainErrors.Traffic.SensorDataNotFound, 404);
        }

        var dto = new VehicleEnvironmentDto
        {
            VehicleId = sensor.VehicleId,
            TemperatureCelsius = sensor.TemperatureCelsius,
            HumidityPercentage = sensor.HumidityPercentage,
            AirQualityIndex = sensor.AirQualityIndex,
            CapturedAtUtc = sensor.CapturedAtUtc
        };

        return Result<VehicleEnvironmentDto>.Success(dto, 200);
    }
}
