using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs.Auth;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.Commands;

public sealed record VerifyDocumentsCommand(string UserId, VerifyDocumentsRequestDto Request);

public sealed class VerifyDocumentsCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthRepository _authRepository;

    public VerifyDocumentsCommandHandler(
        UserManager<ApplicationUser> userManager,
        IAuthRepository authRepository)
    {
        _userManager     = userManager;
        _authRepository  = authRepository;
    }

    public async Task<Result<VerifyDocumentsResponseDto>> Handle(
        VerifyDocumentsCommand command,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(command.UserId);
        if (user is null)
            return Result<VerifyDocumentsResponseDto>.Failure(DomainErrors.Common.NotFound, 404);

        var req = command.Request;

        // ── 1. Save personal document URLs pipe-delimited into ProviderDocuments ──
        var docParts = new[]
        {
            req.IdFrontUrl,
            req.IdBackUrl,
            req.LicenseFrontUrl,
            req.LicenseBackUrl
        };

        user.ProviderDocuments = string.Join("|", docParts.Where(d => !string.IsNullOrWhiteSpace(d)));
        await _userManager.UpdateAsync(user);

        // ── 2. Upsert the user's Vehicle (if provided) ────────────────────────────
        Guid vehicleId = Guid.Empty;

        if (!string.IsNullOrWhiteSpace(req.VehicleMake) && req.VehicleMake != "Unknown")
        {
            var existing = await _authRepository.GetDefaultVehicleAsync(user.Id, cancellationToken);

            if (existing is not null)
            {
                // Update existing vehicle
                existing.Make                 = req.VehicleMake;
                existing.Brand                = req.VehicleMake;
                existing.Model                = req.VehicleModel;
                existing.PlateNumber          = req.VehiclePlateNumber;
                existing.Color                = req.VehicleColor;
                existing.Year                 = req.VehicleYear;
                existing.Type                 = ParseVehicleType(req.VehicleType);
                existing.RegistrationPhotoUrl = BuildCarPhotoUrl(req.CarFrontUrl, req.CarBackUrl);
                existing.IsDefault            = true;

                vehicleId = existing.Id;
            }
            else
            {
                // Create new vehicle
                var vehicle = new Vehicle
                {
                    OwnerId               = user.Id,
                    Make                  = req.VehicleMake,
                    Brand                 = req.VehicleMake,
                    Model                 = req.VehicleModel,
                    PlateNumber           = req.VehiclePlateNumber,
                    Color                 = req.VehicleColor,
                    Year                  = req.VehicleYear,
                    Type                  = ParseVehicleType(req.VehicleType),
                    RegistrationPhotoUrl  = BuildCarPhotoUrl(req.CarFrontUrl, req.CarBackUrl),
                    IsDefault             = true
                };

                await _authRepository.AddVehicleAsync(vehicle, cancellationToken);
                vehicleId = vehicle.Id;
            }
        }

        await _authRepository.SaveChangesAsync(cancellationToken);

        return Result<VerifyDocumentsResponseDto>.Success(new VerifyDocumentsResponseDto
        {
            Success   = true,
            Message   = "Documents submitted successfully.",
            VehicleId = vehicleId
        }, 200);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>Store both car photo URLs pipe-delimited in RegistrationPhotoUrl.</summary>
    private static string? BuildCarPhotoUrl(string? front, string? back)
    {
        var parts  = new[] { front, back }.Where(p => !string.IsNullOrWhiteSpace(p));
        var joined = string.Join("|", parts);
        return string.IsNullOrWhiteSpace(joined) ? null : joined;
    }

    private static VehicleType ParseVehicleType(string raw) =>
        Enum.TryParse<VehicleType>(raw, ignoreCase: true, out var result)
            ? result
            : VehicleType.Car;
}
