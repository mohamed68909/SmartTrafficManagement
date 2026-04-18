using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Sos;

public sealed record GetSosHistoryQuery(string ClientId);
public sealed record CancelSosCommand(string ClientId, Guid RequestId);
public sealed record RateSosCommand(Guid RequestId, int Rating, string? Comment);

public sealed class GetSosHistoryQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetSosHistoryQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<RequestDetailsDto>>> Handle(GetSosHistoryQuery request, CancellationToken cancellationToken)
    {
        var items = await _repo.GetByClientAsync(request.ClientId, cancellationToken);
        var payload = items.Select(x => new RequestDetailsDto
        {
            Id = x.Id,
            VehicleId = x.VehicleId,
            ClientId = x.ClientId,
            ProviderId = x.ProviderId,
            ServiceType = x.ServiceType,
            Status = x.Status,
            Latitude = x.Latitude,
            Longitude = x.Longitude,
            RequestedAtUtc = x.RequestedAtUtc
        }).ToList();
        return Result<IReadOnlyList<RequestDetailsDto>>.Success(payload, 200);
    }
}

public sealed class CancelSosCommandHandler
{
    private readonly IServiceRequestRepository _repo;
    public CancelSosCommandHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(CancelSosCommand request, CancellationToken cancellationToken)
    {
        var item = await _repo.GetByIdAsync(request.RequestId, cancellationToken);
        if (item is null || item.ClientId != request.ClientId) return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        if (item.Status is RequestStatus.Completed or RequestStatus.Cancelled) return Result<bool>.Failure(DomainErrors.Sos.InvalidState, 409);
        item.Status = RequestStatus.Cancelled;
        item.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

public sealed class RateSosCommandHandler
{
    public Task<Result<bool>> Handle(RateSosCommand request, CancellationToken cancellationToken)
    {
        // Placeholder until ProviderReview entity/repository is fully introduced.
        return Task.FromResult(Result<bool>.Success(true, 200));
    }
}
