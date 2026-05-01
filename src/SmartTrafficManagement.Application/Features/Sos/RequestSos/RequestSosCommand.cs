using AutoMapper;
using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Sos.RequestSos;

public sealed class RequestSosCommand
{
    public ServiceType ServiceType { get; set; }
    public decimal Lat { get; set; }
    public decimal Lng { get; set; }
    public Guid? VehicleId { get; set; }   // optional — mobile users may not have a registered vehicle
}

public sealed class RequestSosCommandValidator : AbstractValidator<RequestSosCommand>
{
    public RequestSosCommandValidator()
    {
        RuleFor(x => x.Lat).InclusiveBetween(-90m, 90m);
        RuleFor(x => x.Lng).InclusiveBetween(-180m, 180m);
        RuleFor(x => x.ServiceType).IsInEnum();
    }
}

public sealed class RequestSosCommandHandler
{
    private readonly IServiceRequestRepository _serviceRequestRepository;
    private readonly IValidator<RequestSosCommand> _validator;
    private readonly IMapper _mapper;

    public RequestSosCommandHandler(
        IServiceRequestRepository serviceRequestRepository,
        IValidator<RequestSosCommand> validator,
        IMapper mapper)
    {
        _serviceRequestRepository = serviceRequestRepository;
        _validator = validator;
        _mapper = mapper;
    }

    public async Task<Result<RequestDetailsDto>> HandleAsync(
        string clientId,
        RequestSosCommand command,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return Result<RequestDetailsDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<RequestDetailsDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var hasActiveRequest = await _serviceRequestRepository.HasActiveRequestAsync(clientId, cancellationToken);
        if (hasActiveRequest)
        {
            return Result<RequestDetailsDto>.Failure(DomainErrors.Sos.ActiveRequestExists, 409);
        }

        var request = new ServiceRequest
        {
            ClientId    = clientId,
            VehicleId   = command.VehicleId,   // nullable — safe even if null
            ServiceType = command.ServiceType,
            Status      = RequestStatus.Pending,
            Latitude    = command.Lat,
            Longitude   = command.Lng,
            Description = "SOS request"
        };

        await _serviceRequestRepository.AddAsync(request, cancellationToken);
        await _serviceRequestRepository.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<RequestDetailsDto>(request);
        return Result<RequestDetailsDto>.Success(dto, 201);
    }
}
