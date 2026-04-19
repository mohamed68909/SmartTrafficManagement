using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Application.DTOs.Admin;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Admin;

// ── Records ───────────────────────────────────────────────────────────────────
public sealed record GetAdminUrgentQuery();
public sealed record AssignSosCommand(Guid RequestId, AssignSosDto Request);
public sealed record TrackSosQuery(Guid RequestId);
public sealed record GetAdminApprovalsQuery();
public sealed record GetAdminApprovalStatsQuery();
public sealed record GetProviderDocsQuery(string ProviderId);
public sealed record ApproveProviderCommand(string ProviderId);
public sealed record RejectProviderCommand(string ProviderId, string Reason);

// ── 1: Urgent SOS list ────────────────────────────────────────────────────────

/// <summary>GET /api/admin/urgent</summary>
public sealed class GetAdminUrgentQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public GetAdminUrgentQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<AdminUrgentSosDto>>> Handle(GetAdminUrgentQuery request, CancellationToken cancellationToken)
    {
        var list = await _repo.GetUrgentAsync(cancellationToken);

        var result = list.Select(r => new AdminUrgentSosDto
        {
            RequestId    = r.Id,
            ClientName   = $"{r.Client.FirstName} {r.Client.LastName}".Trim(),
            ClientPhone  = r.Client.PhoneNumber ?? string.Empty,
            ServiceType  = r.ServiceType,
            Status       = r.Status,
            Latitude     = r.Latitude,
            Longitude    = r.Longitude,
            ProviderName = r.Provider is null ? null : $"{r.Provider.FirstName} {r.Provider.LastName}".Trim(),
            RequestedAt  = r.RequestedAtUtc
        }).ToList<AdminUrgentSosDto>();

        return Result<IReadOnlyList<AdminUrgentSosDto>>.Success(result, 200);
    }
}

// ── 2: Manually assign SOS ────────────────────────────────────────────────────

/// <summary>POST /api/admin/urgent/{id}/assign</summary>
public sealed class AssignSosCommandHandler
{
    private readonly IServiceRequestRepository _repo;
    private readonly UserManager<ApplicationUser> _userManager;

    public AssignSosCommandHandler(IServiceRequestRepository repo, UserManager<ApplicationUser> userManager)
    {
        _repo        = repo;
        _userManager = userManager;
    }

    public async Task<Result<bool>> Handle(AssignSosCommand request, CancellationToken cancellationToken)
    {
        var sos = await _repo.GetByIdAsync(request.RequestId, cancellationToken);
        if (sos is null) return Result<bool>.Failure(DomainErrors.Sos.RequestNotFound, 404);

        if (sos.Status != RequestStatus.Pending && sos.Status != RequestStatus.Accepted)
            return Result<bool>.Failure(DomainErrors.Sos.InvalidState, 400);

        var provider = await _userManager.FindByIdAsync(request.Request.ProviderId);
        if (provider is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        sos.ProviderId    = request.Request.ProviderId;
        sos.Status        = RequestStatus.Accepted;
        sos.Description   = string.IsNullOrWhiteSpace(request.Request.Note)
                                ? sos.Description
                                : $"{sos.Description} [Admin note: {request.Request.Note}]";
        sos.UpdatedOnUtc  = DateTime.UtcNow;

        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

// ── 3: Track SOS ─────────────────────────────────────────────────────────────

/// <summary>GET /api/admin/urgent/{id}/track</summary>
public sealed class TrackSosQueryHandler
{
    private readonly IServiceRequestRepository _repo;
    public TrackSosQueryHandler(IServiceRequestRepository repo) => _repo = repo;

    public async Task<Result<AdminSosTrackDto>> Handle(TrackSosQuery request, CancellationToken cancellationToken)
    {
        var sos = await _repo.GetByIdWithDetailsAsync(request.RequestId, cancellationToken);
        if (sos is null) return Result<AdminSosTrackDto>.Failure(DomainErrors.Sos.RequestNotFound, 404);

        return Result<AdminSosTrackDto>.Success(new AdminSosTrackDto
        {
            RequestId    = sos.Id,
            Status       = sos.Status,
            ClientName   = $"{sos.Client.FirstName} {sos.Client.LastName}".Trim(),
            ProviderName = sos.Provider is null ? null : $"{sos.Provider.FirstName} {sos.Provider.LastName}".Trim(),
            ClientLat    = sos.Latitude,
            ClientLng    = sos.Longitude,
            // Provider real-time location is not yet stored on the entity;
            // return null — wire up when location tracking is added.
            ProviderLat  = null,
            ProviderLng  = null,
            ServiceType  = sos.ServiceType,
            RequestedAt  = sos.RequestedAtUtc
        }, 200);
    }
}

// ── 4: List pending approvals ─────────────────────────────────────────────────

/// <summary>GET /api/admin/approvals</summary>
public sealed class GetAdminApprovalsQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public GetAdminApprovalsQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<IReadOnlyList<AdminApprovalRowDto>>> Handle(GetAdminApprovalsQuery request, CancellationToken cancellationToken)
    {
        var providers = await _userManager.GetUsersInRoleAsync(AppRoles.Provider);

        var pending = providers
            .Where(u => u.ProviderStatus == null || u.ProviderStatus == ProviderStatus.Pending)
            .OrderBy(u => u.FirstName)
            .Select(u => new AdminApprovalRowDto
            {
                ProviderId   = u.Id,
                Name         = $"{u.FirstName} {u.LastName}".Trim(),
                Email        = u.Email ?? string.Empty,
                Phone        = u.PhoneNumber ?? string.Empty,
                Status       = u.ProviderStatus ?? ProviderStatus.Pending,
                RegisteredAt = u.LockoutEnd?.UtcDateTime ?? DateTime.UtcNow
            })
            .ToList<AdminApprovalRowDto>();

        return Result<IReadOnlyList<AdminApprovalRowDto>>.Success(pending, 200);
    }
}

// ── 5: Approval stats ─────────────────────────────────────────────────────────

/// <summary>GET /api/admin/approvals/stats</summary>
public sealed class GetAdminApprovalStatsQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public GetAdminApprovalStatsQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<AdminApprovalStatsDto>> Handle(GetAdminApprovalStatsQuery request, CancellationToken cancellationToken)
    {
        var providers = await _userManager.GetUsersInRoleAsync(AppRoles.Provider);

        return Result<AdminApprovalStatsDto>.Success(new AdminApprovalStatsDto
        {
            Pending  = providers.Count(u => u.ProviderStatus == null || u.ProviderStatus == ProviderStatus.Pending),
            Approved = providers.Count(u => u.ProviderStatus == ProviderStatus.Approved),
            Rejected = providers.Count(u => u.ProviderStatus == ProviderStatus.Rejected)
        }, 200);
    }
}

// ── 6: Provider documents ─────────────────────────────────────────────────────

/// <summary>GET /api/admin/approvals/{id}/docs</summary>
public sealed class GetProviderDocsQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public GetProviderDocsQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<AdminProviderDocsDto>> Handle(GetProviderDocsQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<AdminProviderDocsDto>.Failure(DomainErrors.Common.NotFound, 404);

        var docs = string.IsNullOrWhiteSpace(user.ProviderDocuments)
            ? Array.Empty<string>()
            : user.ProviderDocuments.Split('|', StringSplitOptions.RemoveEmptyEntries);

        return Result<AdminProviderDocsDto>.Success(new AdminProviderDocsDto
        {
            ProviderId = user.Id,
            Name       = $"{user.FirstName} {user.LastName}".Trim(),
            Documents  = docs
        }, 200);
    }
}

// ── 7: Approve provider ───────────────────────────────────────────────────────

/// <summary>POST /api/admin/approvals/{id}/approve</summary>
public sealed class ApproveProviderCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public ApproveProviderCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(ApproveProviderCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        user.ProviderStatus = ProviderStatus.Approved;
        user.IsActive       = true;
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}

// ── 8: Reject provider ────────────────────────────────────────────────────────

/// <summary>POST /api/admin/approvals/{id}/reject</summary>
public sealed class RejectProviderCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public RejectProviderCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(RejectProviderCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.ProviderId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        user.ProviderStatus = ProviderStatus.Rejected;
        user.IsActive       = false;
        // Append rejection reason to Address as a note (no separate field needed)
        user.Address        = $"[Rejected: {request.Reason}]";
        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}
