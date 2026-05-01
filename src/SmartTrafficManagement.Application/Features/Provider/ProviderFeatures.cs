using FluentValidation;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs.Provider;
using SmartTrafficManagement.Application.Features.Sos.AcceptSos;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Provider;

// ── Existing records ──
public sealed record GetAvailableJobsQuery();
public sealed record GetProviderDashboardQuery(string ProviderId);
public sealed record GetProviderHistoryQuery(string ProviderId);
public sealed record AcceptJobCommand(string ProviderId, Guid RequestId);
public sealed record RejectJobCommand(string ProviderId, Guid RequestId);
public sealed record UpdateJobStatusCommand(string ProviderId, UpdateProviderRequestStatusDto Request);
public sealed record UpdateProviderLocationCommand(string ProviderId, UpdateProviderLocationDto Request);

// ── New records ──
public sealed record GetProviderEarningsQuery(string ProviderId);
public sealed record GetProviderEarningsWeeklyQuery(string ProviderId);
public sealed record GetProviderActiveMissionQuery(string ProviderId);
public sealed record UpdateJobStatusPostCommand(string ProviderId, UpdateProviderRequestStatusDto Request);
public sealed record GetProviderScheduleQuery(string ProviderId);
public sealed record UpdateProviderScheduleCommand(string ProviderId, UpdateProviderScheduleDto Request);
public sealed record ToggleProviderOnlineCommand(string ProviderId, bool Online);
public sealed record GetProviderProfileQuery(string ProviderId);

// ── Validators ──
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

// ════ EXISTING HANDLERS ════

public sealed class GetAvailableJobsQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetAvailableJobsQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<ProviderJobDto>>> Handle(GetAvailableJobsQuery request, CancellationToken cancellationToken)
    {
        var jobs = await _repo.GetPendingAsync(cancellationToken);
        var payload = jobs.Select(x => new ProviderJobDto
        {
            RequestId   = x.Id,
            ServiceType = x.ServiceType,
            Latitude    = x.Latitude,
            Longitude   = x.Longitude,
            CreatedAt   = x.RequestedAtUtc
        }).ToList();
        return Result<IReadOnlyList<ProviderJobDto>>.Success(payload, 200);
    }
}

public sealed class AcceptJobCommandHandler
{
    private readonly AcceptSosCommandHandler _acceptSosHandler;

    public AcceptJobCommandHandler(AcceptSosCommandHandler acceptSosHandler)
        => _acceptSosHandler = acceptSosHandler;

    public async Task<Result<bool>> Handle(AcceptJobCommand request, CancellationToken cancellationToken)
    {
        var sosCommand = new AcceptSosCommand { RequestId = request.RequestId };
        var result = await _acceptSosHandler.HandleAsync(request.ProviderId, sosCommand, cancellationToken);

        return result.IsSuccess
            ? Result<bool>.Success(true, result.StatusCode)
            : Result<bool>.Failure(result.Error!, result.StatusCode);
    }
}

public sealed class RejectJobCommandHandler
{
    private readonly IServiceRequestRepository _repo;

    public RejectJobCommandHandler(IServiceRequestRepository repo)
        => _repo = repo;

    public async Task<Result<bool>> Handle(RejectJobCommand request, CancellationToken cancellationToken)
    {
        var job = await _repo.GetByIdAsync(request.RequestId, cancellationToken);
        if (job is null)
            return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);

        if (job.ProviderId != request.ProviderId && job.ProviderId != null)
            return Result<bool>.Failure(DomainErrors.Common.Forbidden, 403);

        job.ProviderId = null;
        job.Status = RequestStatus.Pending;
        job.UpdatedOnUtc = DateTime.UtcNow;
        
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

public sealed class GetProviderDashboardQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetProviderDashboardQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<ProviderDashboardDto>> Handle(GetProviderDashboardQuery request, CancellationToken cancellationToken)
    {
        var jobs      = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var completed = jobs.Count(x => x.Status == RequestStatus.Completed);
        var active    = jobs.Count(x => x.Status == RequestStatus.Accepted || x.Status == RequestStatus.InProgress);
        var earnings  = jobs.Where(x => x.Status == RequestStatus.Completed).Sum(x => x.EstimatedCost);

        return Result<ProviderDashboardDto>.Success(new ProviderDashboardDto
        {
            TotalJobs     = jobs.Count,
            CompletedJobs = completed,
            ActiveJobs    = active,
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
        var jobs    = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var payload = jobs.Select(x => new ProviderHistoryItemDto
        {
            RequestId      = x.Id,
            ServiceType    = x.ServiceType,
            Status         = x.Status,
            EstimatedCost  = x.EstimatedCost,
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
        if (job is null)                      return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        if (job.ProviderId != request.ProviderId) return Result<bool>.Failure(DomainErrors.Common.Forbidden, 403);
        job.Status        = request.Request.Status;
        job.UpdatedOnUtc  = DateTime.UtcNow;
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
        if (job is null)                          return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);
        if (job.ProviderId != request.ProviderId) return Result<bool>.Failure(DomainErrors.Common.Forbidden, 403);
        job.Latitude     = request.Request.Latitude;
        job.Longitude    = request.Request.Longitude;
        job.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

// ════ NEW HANDLERS ════

/// <summary>GET /provider/earnings — total, this-month, last-month, daily sums for last 7 days.</summary>
public sealed class GetProviderEarningsQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetProviderEarningsQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<ProviderEarningsDto>> Handle(GetProviderEarningsQuery request, CancellationToken cancellationToken)
    {
        var jobs      = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var completed = jobs.Where(j => j.Status == RequestStatus.Completed).ToList();

        var now            = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = thisMonthStart.AddMonths(-1);
        var weekStart      = now.Date.AddDays(-6);

        var weekly = Enumerable.Range(0, 7).Select(i =>
        {
            var day = weekStart.AddDays(i);
            return new ProviderEarningsDayDto
            {
                Day    = day.ToString("ddd"),
                Amount = completed.Where(j => j.RequestedAtUtc.Date == day).Sum(j => j.EstimatedCost)
            };
        }).ToList();

        return Result<ProviderEarningsDto>.Success(new ProviderEarningsDto
        {
            Total     = completed.Sum(j => j.EstimatedCost),
            ThisMonth = completed.Where(j => j.RequestedAtUtc >= thisMonthStart).Sum(j => j.EstimatedCost),
            LastMonth = completed.Where(j => j.RequestedAtUtc >= lastMonthStart && j.RequestedAtUtc < thisMonthStart).Sum(j => j.EstimatedCost),
            Weekly    = weekly
        }, 200);
    }
}

/// <summary>GET /provider/earnings/weekly — List&lt;{day,amount}&gt; for last 7 days.</summary>
public sealed class GetProviderEarningsWeeklyQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetProviderEarningsWeeklyQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<ProviderEarningsDayDto>>> Handle(GetProviderEarningsWeeklyQuery request, CancellationToken cancellationToken)
    {
        var jobs      = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var completed = jobs.Where(j => j.Status == RequestStatus.Completed).ToList();
        var weekStart = DateTime.UtcNow.Date.AddDays(-6);

        var weekly = Enumerable.Range(0, 7).Select(i =>
        {
            var day = weekStart.AddDays(i);
            return new ProviderEarningsDayDto
            {
                Day    = day.ToString("ddd"),
                Amount = completed.Where(j => j.RequestedAtUtc.Date == day).Sum(j => j.EstimatedCost)
            };
        }).ToList<ProviderEarningsDayDto>();

        return Result<IReadOnlyList<ProviderEarningsDayDto>>.Success(weekly, 200);
    }
}

/// <summary>GET /provider/active-mission — current accepted or in-progress request with client info.</summary>
public sealed class GetProviderActiveMissionQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetProviderActiveMissionQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<ProviderActiveMissionDto?>> Handle(GetProviderActiveMissionQuery request, CancellationToken cancellationToken)
    {
        var jobs   = await _repo.GetByProviderAsync(request.ProviderId, cancellationToken);
        var active = jobs.FirstOrDefault(j => j.Status == RequestStatus.Accepted || j.Status == RequestStatus.InProgress);

        if (active is null)
            return Result<ProviderActiveMissionDto?>.Success(null, 200);

        return Result<ProviderActiveMissionDto?>.Success(new ProviderActiveMissionDto
        {
            RequestId   = active.Id,
            ServiceType = active.ServiceType,
            Status      = active.Status,
            Latitude    = active.Latitude,
            Longitude   = active.Longitude,
            ClientName  = active.Client is not null
                              ? $"{active.Client.FirstName} {active.Client.LastName}".Trim()
                              : string.Empty,
            ClientPhone = active.Client?.PhoneNumber ?? string.Empty,
            RequestedAt = active.RequestedAtUtc
        }, 200);
    }
}

/// <summary>POST /provider/active-mission/status — POST alias for PATCH /jobs/status.</summary>
public sealed class UpdateJobStatusPostCommandHandler
{
    private readonly UpdateJobStatusCommandHandler _inner;
    public UpdateJobStatusPostCommandHandler(UpdateJobStatusCommandHandler inner) => _inner = inner;

    public Task<Result<bool>> Handle(UpdateJobStatusPostCommand request, CancellationToken cancellationToken)
        => _inner.Handle(new UpdateJobStatusCommand(request.ProviderId, request.Request), cancellationToken);
}

/// <summary>GET /provider/schedule — reads schedule persisted in ApplicationUser.Address.</summary>
public sealed class GetProviderScheduleQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public GetProviderScheduleQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<ProviderScheduleDto>> Handle(GetProviderScheduleQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<ProviderScheduleDto>.Failure(DomainErrors.Common.NotFound, 404);
        return Result<ProviderScheduleDto>.Success(ParseSchedule(user.Address), 200);
    }

    // Schedule stored as "Mon,Tue,Wed|8|18" in Address field (provider-specific).
    private static ProviderScheduleDto ParseSchedule(string? raw)
    {
        if (!string.IsNullOrWhiteSpace(raw) && raw.Contains('|'))
        {
            var parts = raw.Split('|');
            if (parts.Length == 3 && int.TryParse(parts[1], out var s) && int.TryParse(parts[2], out var e))
                return new ProviderScheduleDto
                {
                    WorkingDays = parts[0].Split(',', StringSplitOptions.RemoveEmptyEntries),
                    StartHour   = s,
                    EndHour     = e
                };
        }

        return new ProviderScheduleDto
        {
            WorkingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"],
            StartHour   = 8,
            EndHour     = 18
        };
    }
}

/// <summary>PUT /provider/schedule — persists schedule into ApplicationUser.Address.</summary>
public sealed class UpdateProviderScheduleCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public UpdateProviderScheduleCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(UpdateProviderScheduleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        var dto      = request.Request;
        user.Address = $"{string.Join(',', dto.WorkingDays)}|{dto.StartHour}|{dto.EndHour}";
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}

/// <summary>POST /provider/status — toggles IsActive on the provider user record.</summary>
public sealed class ToggleProviderOnlineCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public ToggleProviderOnlineCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(ToggleProviderOnlineCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        user.IsActive = request.Online;
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(request.Online, 200);
    }
}

/// <summary>GET /provider/profile — name, phone, email, rating placeholder, total completed jobs.</summary>
public sealed class GetProviderProfileQueryHandler
{
    private readonly UserManager<ApplicationUser>  _userManager;
    private readonly IServiceRequestRepository     _repo;

    public GetProviderProfileQueryHandler(UserManager<ApplicationUser> userManager, IServiceRequestRepository repo)
    {
        _userManager = userManager;
        _repo        = repo;
    }

    public async Task<Result<ProviderProfileDto>> Handle(GetProviderProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<ProviderProfileDto>.Failure(DomainErrors.Common.NotFound, 404);

        var totalJobs = await _repo.CountCompletedByProviderAsync(request.ProviderId, cancellationToken);

        return Result<ProviderProfileDto>.Success(new ProviderProfileDto
        {
            Name      = $"{user.FirstName} {user.LastName}".Trim(),
            Phone     = user.PhoneNumber ?? string.Empty,
            Email     = user.Email,
            Rating    = 0,       // wire up Ratings repository when ready
            TotalJobs = totalJobs,
            IsOnline  = user.IsActive
        }, 200);
    }
}
