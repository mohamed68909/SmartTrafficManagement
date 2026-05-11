using SmartTrafficManagement.Application.DTOs.Garage;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Modules.Garage.Domain.Interfaces;

namespace SmartTrafficManagement.Application.Features.Garage.Commands;

public sealed record AddVehicleCommand(string UserId, AddVehicleRequestDto Request);
public sealed record UpdateVehicleCommand(string UserId, Guid VehicleId, UpdateVehicleRequestDto Request);
public sealed record DeleteVehicleCommand(string UserId, Guid VehicleId);

public sealed class AddVehicleCommandHandler
{
    private readonly IGarageRepository _repository;

    public AddVehicleCommandHandler(IGarageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<VehicleResponseDto>> Handle(AddVehicleCommand command, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<VehicleType>(command.Request.Type, true, out var vehicleType))
        {
            return Result<VehicleResponseDto>.Failure(DomainErrors.Common.Validation("Vehicle type is invalid."), 400);
        }

        var vehicle = new Vehicle
        {
            OwnerId = command.UserId,
            Make = command.Request.Make,
            Brand = command.Request.Make,
            Model = command.Request.Model,
            Year = command.Request.Year,
            PlateNumber = command.Request.PlateNumber,
            Color = command.Request.Color,
            Type = vehicleType,
            IsDefault = command.Request.IsDefault,
            RegistrationPhotoUrl = command.Request.RegistrationPhotoUrl
        };

        await _repository.AddAsync(vehicle, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result<VehicleResponseDto>.Success(ToDto(vehicle), 201);
    }

    private static VehicleResponseDto ToDto(Vehicle vehicle) => new()
    {
        Id = vehicle.Id,
        Make = vehicle.Make,
        Model = vehicle.Model,
        Year = vehicle.Year,
        PlateNumber = vehicle.PlateNumber,
        Color = vehicle.Color,
        Type = vehicle.Type.ToString(),
        IsDefault = vehicle.IsDefault,
        RegistrationPhotoUrl = vehicle.RegistrationPhotoUrl
    };
}

public sealed class UpdateVehicleCommandHandler
{
    private readonly IGarageRepository _repository;

    public UpdateVehicleCommandHandler(IGarageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<VehicleResponseDto>> Handle(UpdateVehicleCommand command, CancellationToken cancellationToken)
    {
        var vehicle = await _repository.GetByIdAsync(command.VehicleId, cancellationToken);
        if (vehicle is null || vehicle.IsDeleted || vehicle.OwnerId != command.UserId)
        {
            return Result<VehicleResponseDto>.Failure(DomainErrors.Vehicles.VehicleNotFound, 404);
        }

        if (!Enum.TryParse<VehicleType>(command.Request.Type, true, out var vehicleType))
        {
            return Result<VehicleResponseDto>.Failure(DomainErrors.Common.Validation("Vehicle type is invalid."), 400);
        }

        vehicle.Make = command.Request.Make;
        vehicle.Brand = command.Request.Make;
        vehicle.Model = command.Request.Model;
        vehicle.Year = command.Request.Year;
        vehicle.Color = command.Request.Color;
        vehicle.Type = vehicleType;
        vehicle.IsDefault = command.Request.IsDefault;
        vehicle.RegistrationPhotoUrl = command.Request.RegistrationPhotoUrl;
        vehicle.UpdatedOnUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return Result<VehicleResponseDto>.Success(new VehicleResponseDto
        {
            Id = vehicle.Id,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
            PlateNumber = vehicle.PlateNumber,
            Color = vehicle.Color,
            Type = vehicle.Type.ToString(),
            IsDefault = vehicle.IsDefault,
            RegistrationPhotoUrl = vehicle.RegistrationPhotoUrl
        }, 200);
    }
}

public sealed class DeleteVehicleCommandHandler
{
    private readonly IGarageRepository _repository;

    public DeleteVehicleCommandHandler(IGarageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteVehicleCommand command, CancellationToken cancellationToken)
    {
        var vehicle = await _repository.GetByIdAsync(command.VehicleId, cancellationToken);
        if (vehicle is null || vehicle.IsDeleted || vehicle.OwnerId != command.UserId)
        {
            return Result<bool>.Failure(DomainErrors.Vehicles.VehicleNotFound, 404);
        }

        vehicle.IsDeleted = true;
        vehicle.UpdatedOnUtc = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}
