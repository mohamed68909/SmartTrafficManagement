using FluentValidation;
using SmartTrafficManagement.Application.DTOs.Provider;
using SmartTrafficManagement.Application.Features.Sos.AcceptSos;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Provider;

public sealed record GetAvailableJobsQuery();
public sealed record GetProviderDashboardQuery(string ProviderId);
public sealed record GetProviderHistoryQuery(string ProviderId);
public sealed record AcceptJobCommand(string ProviderId, Guid RequestId);
public sealed record UpdateJobStatusCommand(string ProviderId, UpdateProviderRequestStatusDto Request);
public sealed record UpdateProviderLocationCommand(string ProviderId, UpdateProviderLocationDto Request);

public sealed class UpdateProviderRequestStatusDtoValidator : AbstractValidator<UpdateProviderRequestStatusDto>
{
    public UpdateProviderRequestStatusDtoValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
    }
}

public sealed class UpdateProviderLocationDtoValidator : AbstractValidator<UpdateProviderLocationDto>
{
    public UpdateProviderLocationDtoValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
        RuleFor(x => x.Latitude).InclusiveBetween(-90m, 90m);
        RuleFor(x => x.Longitude).InclusiveBetween(-180m, 180m);
    }
}

public sealed class GetAvailableJobsQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetAvailableJobsQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<ProviderJobDto>>> Handle(GetAvailableJobsQuery request, CancellationToken cancellationToken)
    {
        var jobs = await _repo.GetPendingAsync(cancellationToken);
        var payload = jobs.Select(x => new ProviderJobDto
        {
            RequestId = x.Id,
            ServiceType = x.ServiceType,
            Latitude = x.Latitude,
            Longitude = x.Longitude,
            CreatedAt = x.RequestedAtUtc
        }).ToList();
        return Result<IReadOnlyList<ProviderJobDto>>.Success(payload, 200);
    }
}

public sealed class AcceptJobCommandHandler
{
    private readonly AcceptSosCommandHandler _acceptSosHandler;

    public AcceptJobCommandHandler(AcceptSosCommandHandler acceptSosHandler)
    {
        _acceptSosHandler = acceptSosHandler;
    }

    public async Task<Result<bool>> Handle(AcceptJobCommand request, CancellationToken cancellationToken)
    {
        var sosCommand = new AcceptSosCommand { RequestId = request.RequestId };
        var result = await _acceptSosHandler.HandleAsync(request.ProviderId, sosCommand, cancellationToken);

        return result.IsSuccess
            ? Result<bool>.Success(true, result.StatusCode)
            : Result<bool>.Failure(result.Error!, result.StatusCode);
    }
}

public sealed class GetProviderDashboardQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetProviderDashboardQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<ProviderDashboardDto>> Handle(GetProviderDashboardQuery request, CancellationToken cancellationToken)
    {
        var jobs = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var completed = jobs.Count(x => x.Status == RequestStatus.Completed);
        var active = jobs.Count(x => x.Status == RequestStatus.Accepted || x.Status == RequestStatus.InProgress);
        var earnings = jobs
            .Where(x => x.Status == RequestStatus.Completed)
            .Sum(x => x.EstimatedCost);

        return Result<ProviderDashboardDto>.Success(new ProviderDashboardDto
        {
            TotalJobs = jobs.Count,
            CompletedJobs = completed,
            ActiveJobs = active,
            TotalEarnings = earnings
        }, 200);
    }
}

public sealed class GetProviderHistoryQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetProviderHistoryQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<ProviderHistoryItemDto>>> Handle(GetProviderHistoryQuery request, CancellationToken cancellationToken)
    {
        var jobs = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var payload = jobs.Select(x => new ProviderHistoryItemDto
        {
            RequestId = x.Id,
            ServiceType = x.ServiceType,
            Status = x.Status,
            EstimatedCost = x.EstimatedCost,
            RequestedAtUtc = x.RequestedAtUtc
        }).ToList();
        return Result<IReadOnlyList<ProviderHistoryItemDto>>.Success(payload, 200);
    }
}

public sealed class UpdateJobStatusCommandHandler
{
    private readonly IServiceRequestRepository _repo;
    public UpdateJobStatusCommandHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(UpdateJobStatusCommand request, CancellationToken cancellationToken)
    {
        var job = await _repo.GetByIdAsync(request.Request.RequestId, cancellationToken);
        if (job is null) return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        if (job.ProviderId != request.ProviderId) return Result<bool>.Failure(DomainErrors.Common.Forbidden, 403);
        job.Status = request.Request.Status;
        job.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

public sealed class UpdateProviderLocationCommandHandler
{
    private readonly IServiceRequestRepository _repo;
    public UpdateProviderLocationCommandHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(UpdateProviderLocationCommand request, CancellationToken cancellationToken)
    {
        var job = await _repo.GetByIdAsync(request.Request.RequestId, cancellationToken);
        if (job is null) return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        if (job.ProviderId != request.ProviderId) return Result<bool>.Failure(DomainErrors.Common.Forbidden, 403);
        job.Latitude = request.Request.Latitude;
        job.Longitude = request.Request.Longitude;
        job.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}
