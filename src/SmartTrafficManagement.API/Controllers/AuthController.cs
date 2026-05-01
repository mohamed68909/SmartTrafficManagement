using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Auth;
using SmartTrafficManagement.Application.Features.Auth.Commands;
using SmartTrafficManagement.Application.Features.Auth.Queries;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/[controller]")]
public sealed class AuthController : BaseController
{
    [AllowAnonymous]
    [HttpPost("register")]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Register(
        [FromBody] RegisterRequestDto request,
        [FromServices] RegisterCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var platform = Request.Headers["X-Platform"].FirstOrDefault() ?? string.Empty;
        var isMobile = platform.Contains("mobile", StringComparison.OrdinalIgnoreCase);

        var result = await handler.Handle(new RegisterCommand(request, isMobile), cancellationToken);
        return ProcessResult(result);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Login(
        [FromBody] LoginRequestDto request,
        [FromServices] LoginCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new LoginCommand(request), cancellationToken);
        return ProcessResult(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> RefreshToken(
        [FromBody] RefreshTokenRequestDto request,
        [FromServices] RefreshTokenCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new RefreshTokenCommand(request), cancellationToken);
        return ProcessResult(result);
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Logout(
        [FromBody] LogoutRequestDto request,
        [FromServices] LogoutCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new LogoutCommand(request), cancellationToken);
        return ProcessResult(result);
    }

    /// <summary>
    /// Send (or resend) an OTP to the user's registered phone / email.
    /// In MVP, this triggers the same flow as forgot-password (logs the OTP token).
    /// Replace with a real SMS/email provider before production.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("send-otp")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> SendOtp(
        [FromBody] ForgotPasswordRequestDto request,
        [FromServices] ForgotPasswordCommandHandler handler,
        CancellationToken cancellationToken)
    {
        // Reuses the forgot-password handler which generates and logs the OTP token.
        // Always returns 200 (never reveals if email exists — security best practice).
        var result = await handler.Handle(new ForgotPasswordCommand(request), cancellationToken);
        return ProcessResult(result);
    }

    [AllowAnonymous]
    [HttpPost("verify-otp")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> VerifyOtp(
        [FromBody] VerifyOtpRequestDto request,
        [FromServices] VerifyOtpCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new VerifyOtpCommand(request), cancellationToken);
        return ProcessResult(result);
    }

    [Authorize]
    [HttpGet("me")]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(Result<ProfileResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Profile(
        [FromServices] GetProfileQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new GetProfileQuery(userId), cancellationToken);
        return ProcessResult(result);
    }

    [Authorize]
    [HttpPut("profile")]
    [HttpPut("profile/update")]
    [ProducesResponseType(typeof(Result<ProfileResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequestDto request,
        [FromServices] UpdateProfileCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new UpdateProfileCommand(userId, request), cancellationToken);
        return ProcessResult(result);
    }

   [Authorize]
    [HttpPatch("change-password")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ChangePassword(
        [FromBody] ChangePasswordRequestDto request,
        [FromServices] ChangePasswordCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var result = await handler.Handle(new ChangePasswordCommand(userId, request), cancellationToken);
        return ProcessResult(result);
    }

    /// <summary>
    /// Sign in (or register) with a Google ID token.
    /// The client obtains this token from the Google Sign-In SDK and forwards it here.
    /// Use the <c>X-Platform: Mobile</c> header to indicate a mobile client.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("google-login")]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> GoogleLogin(
        [FromBody] GoogleLoginRequestDto request,
        [FromServices] GoogleLoginCommandHandler handler,
        CancellationToken cancellationToken)
    {
        // Detect platform — any value of X-Platform containing "mobile" (case-insensitive)
        // is treated as a mobile request, locking the role to Client.
        var platform = Request.Headers["X-Platform"].FirstOrDefault() ?? string.Empty;
        var isMobile = platform.Contains("mobile", StringComparison.OrdinalIgnoreCase);

        var command = new GoogleLoginCommand(request, isMobile);
        var result  = await handler.HandleAsync(command, cancellationToken);
        return ProcessResult(result);
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequestDto request,
        [FromServices] ForgotPasswordCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(
            new ForgotPasswordCommand(request), cancellationToken);
        return ProcessResult(result);
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ResetPassword(
        [FromBody] ResetPasswordRequestDto request,
        [FromServices] ResetPasswordCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(
            new ResetPasswordCommand(request), cancellationToken);
        return ProcessResult(result);
    }
}

