using AutoMapper;
using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Sos.GetSosStatus;

public sealed class GetSosStatusQuery
{
    public Guid RequestId { get; set; }
}

public sealed class GetSosStatusQueryValidator : AbstractValidator<GetSosStatusQuery>
{
    public GetSosStatusQueryValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
    }
}

public sealed class GetSosStatusQueryHandler
{
    private readonly IServiceRequestRepository _serviceRequestRepository;
    private readonly IValidator<GetSosStatusQuery> _validator;
    private readonly IMapper _mapper;

    public GetSosStatusQueryHandler(
        IServiceRequestRepository serviceRequestRepository,
        IValidator<GetSosStatusQuery> validator,
        IMapper mapper)
    {
        _serviceRequestRepository = serviceRequestRepository;
        _validator = validator;
        _mapper = mapper;
    }

    public async Task<Result<SosStatusDto>> HandleAsync(GetSosStatusQuery query, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<SosStatusDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var request = await _serviceRequestRepository.GetByIdWithProviderAsync(query.RequestId, cancellationToken);
        if (request is null)
        {
            return Result<SosStatusDto>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        }

        var dto = _mapper.Map<SosStatusDto>(request);
        return Result<SosStatusDto>.Success(dto, 200);
    }
}
