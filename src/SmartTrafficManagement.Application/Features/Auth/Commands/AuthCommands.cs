using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using SmartTrafficManagement.Application.DTOs.Auth;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.Commands;

public sealed record RegisterCommand(RegisterRequestDto Request, bool IsMobile = false);
public sealed record LoginCommand(LoginRequestDto Request);
public sealed record RefreshTokenCommand(RefreshTokenRequestDto Request);
public sealed record LogoutCommand(LogoutRequestDto Request);
public sealed record VerifyOtpCommand(VerifyOtpRequestDto Request);
public sealed record UpdateProfileCommand(string UserId, UpdateProfileRequestDto Request);
public sealed record ChangePasswordCommand(string UserId, ChangePasswordRequestDto Request);

public sealed class RegisterCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuthRepository _authRepository;

    public RegisterCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtTokenService jwtTokenService,
        IAuthRepository authRepository)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _authRepository = authRepository;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        if (await _userManager.FindByEmailAsync(request.Email) is not null)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.EmailAlreadyExists, 409);
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.IdentityOperationFailed, 400);
        }

        // Determine which role to assign
        string assignedRole;

        if (command.IsMobile)
        {
            // Mobile is always locked to Client
            assignedRole = AppRoles.Client;
        }
        else
        {
            // Web: validate requested role
            var requested = request.RequestedRole?.Trim();
            var webAllowedRoles = new[] { AppRoles.Client, AppRoles.Provider, AppRoles.Seller };

            if (!string.IsNullOrWhiteSpace(requested))
            {
                // Case-insensitive match
                var match = webAllowedRoles.FirstOrDefault(
                    r => string.Equals(r, requested, StringComparison.OrdinalIgnoreCase));

                if (match is null)
                {
                    // Invalid role — delete the user we just created and return error
                    await _userManager.DeleteAsync(user);
                    return Result<AuthResponseDto>.Failure(
                        DomainErrors.Auth.InvalidRoleForRegistration, 400);
                }

                assignedRole = match;
            }
            else
            {
                // No role specified → default to Client
                assignedRole = AppRoles.Client;
            }
        }

        if (!await _roleManager.RoleExistsAsync(assignedRole))
        {
            await _roleManager.CreateAsync(new IdentityRole(assignedRole));
        }

        await _userManager.AddToRoleAsync(user, assignedRole);

        var roles = await _userManager.GetRolesAsync(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);
        await _authRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        return Result<AuthResponseDto>.Success(new AuthResponseDto
        {
            AccessToken = _jwtTokenService.GenerateAccessToken(user, roles),
            RefreshToken = refreshToken.Token,
            User = new ProfileResponseDto
            {
                Id = Guid.Parse(user.Id),
                FirstName = user.FirstName,
                LastName  = user.LastName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Points = user.Points,
                Role = roles.FirstOrDefault() ?? AppRoles.Client,
                ProfilePicture = user.ProfilePicture,
                Address = user.Address
            }
        }, 200);
    }
}

public sealed class LoginCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuthRepository _authRepository;

    public LoginCommandHandler(UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService, IAuthRepository authRepository)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _authRepository = authRepository;
    }

    public async Task<Result<AuthResponseDto>> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.InvalidCredentials, 401);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);
        await _authRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        return Result<AuthResponseDto>.Success(new AuthResponseDto
        {
            AccessToken = _jwtTokenService.GenerateAccessToken(user, roles),
            RefreshToken = refreshToken.Token,
            User = new ProfileResponseDto
            {
                Id = Guid.Parse(user.Id),
                FirstName = user.FirstName,
                LastName  = user.LastName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Points = user.Points,
                Role = roles.FirstOrDefault() ?? AppRoles.Client,
                ProfilePicture = user.ProfilePicture,
                Address = user.Address
            }
        }, 200);
    }
}

public sealed class RefreshTokenCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public RefreshTokenCommandHandler(IAuthRepository authRepository, UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService)
    {
        _authRepository = authRepository;
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var token = await _authRepository.GetActiveRefreshTokenAsync(command.Request.RefreshToken, cancellationToken);
        if (token is null || !token.IsActive)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.InvalidCredentials, 401);
        }

        token.RevokedOnUtc = DateTime.UtcNow;
        var user = token.User;
        var roles = await _userManager.GetRolesAsync(user);
        var newToken = _jwtTokenService.GenerateRefreshToken(user.Id);
        await _authRepository.AddRefreshTokenAsync(newToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        return Result<AuthResponseDto>.Success(new AuthResponseDto
        {
            AccessToken = _jwtTokenService.GenerateAccessToken(user, roles),
            RefreshToken = newToken.Token,
            User = new ProfileResponseDto
            {
                Id = Guid.Parse(user.Id),
                FirstName = user.FirstName,
                LastName  = user.LastName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Points = user.Points,
                Role = roles.FirstOrDefault() ?? AppRoles.Client,
                ProfilePicture = user.ProfilePicture,
                Address = user.Address
            }
        }, 200);
    }
}

public sealed class LogoutCommandHandler
{
    private readonly IAuthRepository _authRepository;

    public LogoutCommandHandler(IAuthRepository authRepository)
    {
        _authRepository = authRepository;
    }

    public async Task<Result<bool>> Handle(LogoutCommand command, CancellationToken cancellationToken)
    {
        var token = await _authRepository.GetActiveRefreshTokenAsync(command.Request.RefreshToken, cancellationToken);
        if (token is null)
        {
            return Result<bool>.Success(true, 200);
        }

        token.RevokedOnUtc = DateTime.UtcNow;
        await _authRepository.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

public sealed class VerifyOtpCommandHandler
{
    public Task<Result<bool>> Handle(VerifyOtpCommand command, CancellationToken cancellationToken)
    {
        // Placeholder MVP until OTP entity/service is introduced.
        var isValid = command.Request.OtpCode == "123456";
        return Task.FromResult(isValid
            ? Result<bool>.Success(true, 200)
            : Result<bool>.Failure(DomainErrors.Auth.InvalidCredentials, 400));
    }
}

public sealed class UpdateProfileCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UpdateProfileCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<ProfileResponseDto>> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(command.UserId);
        if (user is null)
        {
            return Result<ProfileResponseDto>.Failure(DomainErrors.Common.NotFound, 404);
        }

        user.FirstName = command.Request.FirstName;
        user.LastName = command.Request.LastName;
        user.PhoneNumber = command.Request.PhoneNumber;
        user.ProfilePicture = command.Request.ProfilePicture;
        user.Address = command.Request.Address;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);

        return Result<ProfileResponseDto>.Success(new ProfileResponseDto
        {
            Id = Guid.Parse(user.Id),
            FirstName = user.FirstName,
            LastName  = user.LastName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            Points = user.Points,
            Role = roles.FirstOrDefault() ?? AppRoles.Client,
            ProfilePicture = user.ProfilePicture,
            Address = user.Address
        }, 200);
    }
}

public sealed class ChangePasswordCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ChangePasswordCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<bool>> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(command.UserId);
        if (user is null)
        {
            return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);
        }

        var result = await _userManager.ChangePasswordAsync(user, command.Request.CurrentPassword, command.Request.NewPassword);
        if (!result.Succeeded)
        {
            return Result<bool>.Failure(DomainErrors.Auth.InvalidCredentials, 400);
        }

        return Result<bool>.Success(true, 200);
    }
}

public sealed record ForgotPasswordCommand(ForgotPasswordRequestDto Request);
public sealed record ResetPasswordCommand(ResetPasswordRequestDto Request);

public sealed class ForgotPasswordCommandHandler
{
    private readonly Microsoft.AspNetCore.Identity.UserManager<Core.Entities.ApplicationUser> _userManager;
    private readonly Microsoft.Extensions.Logging.ILogger<ForgotPasswordCommandHandler> _logger;

    public ForgotPasswordCommandHandler(
        Microsoft.AspNetCore.Identity.UserManager<Core.Entities.ApplicationUser> userManager,
        Microsoft.Extensions.Logging.ILogger<ForgotPasswordCommandHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(
        ForgotPasswordCommand command,
        CancellationToken cancellationToken)
    {
        // Always return 200 — never reveal if email exists (security)
        var user = await _userManager.FindByEmailAsync(command.Request.Email);
        if (user is null)
            return Result<bool>.Success(true, 200);

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiryUtc = DateTime.UtcNow.AddMinutes(15);
        await _userManager.UpdateAsync(user);

        // TODO: Replace with real email service before production
        _logger.LogInformation(
            "[DEV ONLY] Password reset token for {Email}: {Token}",
            user.Email, token);

        return Result<bool>.Success(true, 200);
    }
}

public sealed class ResetPasswordCommandHandler
{
    private readonly Microsoft.AspNetCore.Identity.UserManager<Core.Entities.ApplicationUser> _userManager;

    public ResetPasswordCommandHandler(
        Microsoft.AspNetCore.Identity.UserManager<Core.Entities.ApplicationUser> userManager)
        => _userManager = userManager;

    public async Task<Result<bool>> Handle(
        ResetPasswordCommand command,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(command.Request.Email);
        if (user is null
            || user.PasswordResetToken != command.Request.Token
            || user.PasswordResetTokenExpiryUtc < DateTime.UtcNow)
        {
            return Result<bool>.Failure(DomainErrors.Auth.InvalidResetToken, 400);
        }

        var result = await _userManager.ResetPasswordAsync(
            user, command.Request.Token, command.Request.NewPassword);

        if (!result.Succeeded)
            return Result<bool>.Failure(DomainErrors.Auth.InvalidResetToken, 400);

        // Invalidate token after use
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiryUtc = null;
        await _userManager.UpdateAsync(user);

        return Result<bool>.Success(true, 200);
    }
}
