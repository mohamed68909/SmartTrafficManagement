using FluentValidation;
using SmartTrafficManagement.Application.Validators.Garage;

namespace SmartTrafficManagement.Application.Features.Garage.Commands;

public sealed class AddVehicleCommandValidator : AbstractValidator<AddVehicleCommand>
{
    public AddVehicleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Request).SetValidator(new AddVehicleRequestDtoValidator());
    }
}

public sealed class UpdateVehicleCommandValidator : AbstractValidator<UpdateVehicleCommand>
{
    public UpdateVehicleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.VehicleId).NotEmpty();
        RuleFor(x => x.Request).SetValidator(new UpdateVehicleRequestDtoValidator());
    }
}

public sealed class DeleteVehicleCommandValidator : AbstractValidator<DeleteVehicleCommand>
{
    public DeleteVehicleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.VehicleId).NotEmpty();
    }
}
