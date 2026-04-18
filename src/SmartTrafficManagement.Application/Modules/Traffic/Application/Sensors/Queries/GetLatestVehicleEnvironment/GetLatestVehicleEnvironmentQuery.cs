using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;

namespace SmartTrafficManagement.Application.Modules.Traffic.Application.Sensors.Queries.GetLatestVehicleEnvironment;

public sealed record GetLatestVehicleEnvironmentQuery(Guid VehicleId);

public sealed class GetLatestVehicleEnvironmentQueryValidator : AbstractValidator<GetLatestVehicleEnvironmentQuery>
{
    public GetLatestVehicleEnvironmentQueryValidator()
    {
        RuleFor(x => x.VehicleId).NotEmpty();
    }
}

public sealed class GetLatestVehicleEnvironmentQueryHandler
{
    private readonly ITrafficModuleRepository _repository;

    public GetLatestVehicleEnvironmentQueryHandler(ITrafficModuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<VehicleEnvironmentDto>> Handle(GetLatestVehicleEnvironmentQuery request, CancellationToken cancellationToken)
    {
        var sensor = await _repository.GetLatestSensorDataByVehicleIdAsync(request.VehicleId, cancellationToken);
        if (sensor is null)
        {
            return Result<VehicleEnvironmentDto>.Failure(DomainErrors.Traffic.SensorDataNotFound, 404);
        }

        return Result<VehicleEnvironmentDto>.Success(new VehicleEnvironmentDto
        {
            VehicleId = sensor.VehicleId,
            TemperatureCelsius = sensor.TemperatureCelsius,
            HumidityPercentage = sensor.HumidityPercentage,
            AirQualityIndex = sensor.AirQualityIndex,
            CapturedAtUtc = sensor.CapturedAtUtc
        }, 200);
    }
}
