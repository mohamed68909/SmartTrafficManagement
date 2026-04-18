using FluentValidation;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Sos.AcceptSos;

public sealed class AcceptSosCommand
{
    public Guid RequestId { get; set; }
}

public sealed class AcceptSosCommandValidator : AbstractValidator<AcceptSosCommand>
{
    public AcceptSosCommandValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
    }
}

public sealed class AcceptSosCommandHandler
{
    private readonly IServiceRequestRepository _serviceRequestRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IValidator<AcceptSosCommand> _validator;

    public AcceptSosCommandHandler(
        IServiceRequestRepository serviceRequestRepository,
        UserManager<ApplicationUser> userManager,
        IValidator<AcceptSosCommand> validator)
    {
        _serviceRequestRepository = serviceRequestRepository;
        _userManager = userManager;
        _validator = validator;
    }

    public async Task<Result<RequestDetailsDto>> HandleAsync(
        string providerUserId,
        AcceptSosCommand command,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(providerUserId))
        {
            return Result<RequestDetailsDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<RequestDetailsDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var provider = await _userManager.FindByIdAsync(providerUserId);
        if (provider is null || !await _userManager.IsInRoleAsync(provider, AppRoles.Provider))
        {
            return Result<RequestDetailsDto>.Failure(DomainErrors.Sos.ProviderOnly, 403);
        }

        var request = await _serviceRequestRepository.GetByIdAsync(command.RequestId, cancellationToken);
        if (request is null)
        {
            return Result<RequestDetailsDto>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        }

        if (request.Status != RequestStatus.Pending)
        {
            return Result<RequestDetailsDto>.Failure(DomainErrors.Sos.InvalidState, 409);
        }

        request.ProviderId = providerUserId;
        request.Status = RequestStatus.Accepted;
        request.UpdatedOnUtc = DateTime.UtcNow;

        await _serviceRequestRepository.SaveChangesAsync(cancellationToken);

        var dto = new RequestDetailsDto
        {
            Id = request.Id,
            VehicleId = request.VehicleId,
            ClientId = request.ClientId,
            ProviderId = request.ProviderId,
            ServiceType = request.ServiceType,
            Status = request.Status,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            RequestedAtUtc = request.RequestedAtUtc
        };

        return Result<RequestDetailsDto>.Success(dto, 200);
    }
}
