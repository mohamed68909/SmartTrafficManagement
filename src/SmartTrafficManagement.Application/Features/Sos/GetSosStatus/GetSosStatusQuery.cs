using AutoMapper;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Sos.GetSosStatus;

public sealed class GetSosStatusQuery
{
    public Guid RequestId { get; set; }
}

public sealed class GetSosStatusQueryHandler
{
    private readonly IServiceRequestRepository _serviceRequestRepository;
    private readonly IMapper _mapper;

    public GetSosStatusQueryHandler(
        IServiceRequestRepository serviceRequestRepository,
        IMapper mapper)
    {
        _serviceRequestRepository = serviceRequestRepository;
        _mapper = mapper;
    }

    public async Task<Result<SosStatusDto>> HandleAsync(GetSosStatusQuery query, CancellationToken cancellationToken = default)
    {
        var request = await _serviceRequestRepository.GetByIdWithProviderAsync(query.RequestId, cancellationToken);
        if (request is null)
            return Result<SosStatusDto>.Failure(DomainErrors.Sos.RequestNotFound, 404);

        var dto = _mapper.Map<SosStatusDto>(request);
        return Result<SosStatusDto>.Success(dto, 200);
    }
}
