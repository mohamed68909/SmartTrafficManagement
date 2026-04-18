using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs.Auth;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.Commands;

// ─────────────────────────────────────────────────────────────────────────────
// Command
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>
/// Command that carries the Google login request plus platform context.
/// </summary>
public sealed record GoogleLoginCommand(
    GoogleLoginRequestDto Request,
    bool IsMobile);

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

public sealed class GoogleLoginCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole>    _roleManager;
    private readonly IJwtTokenService             _jwtTokenService;
    private readonly IAuthRepository              _authRepository;
    private readonly IGoogleTokenVerifier         _googleTokenVerifier;

    public GoogleLoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole>    roleManager,
        IJwtTokenService             jwtTokenService,
        IAuthRepository              authRepository,
        IGoogleTokenVerifier         googleTokenVerifier)
    {
        _userManager         = userManager;
        _roleManager         = roleManager;
        _jwtTokenService     = jwtTokenService;
        _authRepository      = authRepository;
        _googleTokenVerifier = googleTokenVerifier;
    }

    public async Task<Result<AuthResponseDto>> HandleAsync(
        GoogleLoginCommand command,
        CancellationToken  cancellationToken)
    {
        // ── 1. Verify the Google ID token ─────────────────────────────────
        var googlePayload = await _googleTokenVerifier.VerifyAsync(
            command.Request.IdToken, cancellationToken);

        if (googlePayload is null)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.InvalidGoogleToken, 401);
        }

        // ── 2. Resolve the target role ────────────────────────────────────
        // Mobile always gets Client; on web fall back to Client if role is
        // missing, invalid, or privileged (Admin / CSAgent / Seller etc.).
        var targetRole = ResolveRole(command.Request.RequestedRole, command.IsMobile);

        // ── 3. Find or create the user ────────────────────────────────────
        var user = await _userManager.FindByEmailAsync(googlePayload.Email);

        if (user is null)
        {
            // New user — register via Google
            user = new ApplicationUser
            {
                UserName            = googlePayload.Email,
                Email               = googlePayload.Email,
                EmailConfirmed      = true,          // Google already verified the email
                FirstName           = googlePayload.FirstName,
                LastName            = googlePayload.LastName,
                PhoneNumber         = command.Request.PhoneNumber ?? string.Empty,
                ProfilePicture      = googlePayload.PictureUrl,
                GoogleSubject       = googlePayload.Subject,
                GoogleProviderName  = "Google",
                IsActive            = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return Result<AuthResponseDto>.Failure(DomainErrors.Auth.IdentityOperationFailed, 400);
            }

            // Ensure the role exists in the DB
            if (!await _roleManager.RoleExistsAsync(targetRole))
            {
                await _roleManager.CreateAsync(new IdentityRole(targetRole));
            }

            await _userManager.AddToRoleAsync(user, targetRole);
        }
        else
        {
            // Existing user — sync Google fields in case they changed
            var updated = false;

            if (string.IsNullOrWhiteSpace(user.GoogleSubject))
            {
                user.GoogleSubject      = googlePayload.Subject;
                user.GoogleProviderName = "Google";
                updated = true;
            }

            if (string.IsNullOrWhiteSpace(user.ProfilePicture) &&
                !string.IsNullOrWhiteSpace(googlePayload.PictureUrl))
            {
                user.ProfilePicture = googlePayload.PictureUrl;
                updated = true;
            }

            if (updated)
            {
                await _userManager.UpdateAsync(user);
            }

            // Make sure the user has at least one role
            var existingRoles = await _userManager.GetRolesAsync(user);
            if (existingRoles.Count == 0)
            {
                if (!await _roleManager.RoleExistsAsync(targetRole))
                {
                    await _roleManager.CreateAsync(new IdentityRole(targetRole));
                }
                await _userManager.AddToRoleAsync(user, targetRole);
            }
        }

        // ── 4. Issue tokens ───────────────────────────────────────────────
        var roles        = await _userManager.GetRolesAsync(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);
        await _authRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        return Result<AuthResponseDto>.Success(new AuthResponseDto
        {
            AccessToken  = _jwtTokenService.GenerateAccessToken(user, roles),
            RefreshToken = refreshToken.Token,
            User = new ProfileResponseDto
            {
                Id            = Guid.Parse(user.Id),
                FirstName     = user.FirstName,
                LastName      = user.LastName,
                Email         = user.Email ?? string.Empty,
                PhoneNumber   = user.PhoneNumber ?? string.Empty,
                Points        = user.Points,
                Role          = roles.FirstOrDefault() ?? AppRoles.Client,
                ProfilePicture = user.ProfilePicture,
                Address       = user.Address
            }
        }, 200);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private static readonly HashSet<string> AllowedExternalRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        AppRoles.Client,
        AppRoles.Provider,
        AppRoles.Seller
    };

    /// <summary>
    /// Determines the role to assign:
    /// • Mobile → always Client
    /// • Web + no/invalid role → Client
    /// • Web + valid role (Client/Provider/Seller) → that role
    /// • Web + privileged role (Admin/CSAgent) → Client (blocked)
    /// </summary>
    private static string ResolveRole(string? requestedRole, bool isMobile)
    {
        if (isMobile || string.IsNullOrWhiteSpace(requestedRole))
            return AppRoles.Client;

        return AllowedExternalRoles.Contains(requestedRole)
            ? requestedRole
            : AppRoles.Client;
    }
}
