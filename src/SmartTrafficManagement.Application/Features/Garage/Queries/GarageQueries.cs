using SmartTrafficManagement.Application.DTOs.Garage;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Modules.Garage.Domain.Interfaces;

namespace SmartTrafficManagement.Application.Features.Garage.Queries;

public sealed record GetMyVehiclesQuery(string UserId);
public sealed record GetVehicleByIdQuery(string UserId, Guid VehicleId);

public sealed class GetMyVehiclesQueryHandler
{
    private readonly IGarageRepository _repository;

    public GetMyVehiclesQueryHandler(IGarageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<VehicleResponseDto>>> Handle(GetMyVehiclesQuery request, CancellationToken cancellationToken)
    {
        var vehicles = await _repository.GetByOwnerAsync(request.UserId, cancellationToken);
        var payload = vehicles.Select(v => new VehicleResponseDto
        {
            Id = v.Id,
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            PlateNumber = v.PlateNumber,
            Color = v.Color,
            Type = v.Type.ToString(),
            IsDefault = v.IsDefault,
            RegistrationPhotoUrl = v.RegistrationPhotoUrl
        }).ToList();

        return Result<IReadOnlyList<VehicleResponseDto>>.Success(payload, 200);
    }
}

public sealed class GetVehicleByIdQueryHandler
{
    private readonly IGarageRepository _repository;

    public GetVehicleByIdQueryHandler(IGarageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<VehicleResponseDto>> Handle(GetVehicleByIdQuery request, CancellationToken cancellationToken)
    {
        var v = await _repository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (v is null || v.IsDeleted || v.OwnerId != request.UserId)
        {
            return Result<VehicleResponseDto>.Failure(DomainErrors.Vehicles.VehicleNotFound, 404);
        }

        return Result<VehicleResponseDto>.Success(new VehicleResponseDto
        {
            Id = v.Id,
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            PlateNumber = v.PlateNumber,
            Color = v.Color,
            Type = v.Type.ToString(),
            IsDefault = v.IsDefault,
            RegistrationPhotoUrl = v.RegistrationPhotoUrl
        }, 200);
    }
}
