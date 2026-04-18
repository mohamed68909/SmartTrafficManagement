using FluentValidation;
using SmartTrafficManagement.Application.DTOs.Garage;

namespace SmartTrafficManagement.Application.Validators.Garage;

public sealed class AddVehicleRequestDtoValidator : AbstractValidator<AddVehicleRequestDto>
{
    public AddVehicleRequestDtoValidator()
    {
        RuleFor(x => x.Make).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1950, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.PlateNumber).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Type).NotEmpty();
    }
}

public sealed class UpdateVehicleRequestDtoValidator : AbstractValidator<UpdateVehicleRequestDto>
{
    public UpdateVehicleRequestDtoValidator()
    {
        RuleFor(x => x.Make).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1950, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Type).NotEmpty();
    }
}
