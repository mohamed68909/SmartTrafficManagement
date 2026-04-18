namespace SmartTrafficManagement.Application.DTOs.Auth;

public sealed class RegisterRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Web-only. Allowed values: "Provider", "Seller", "Client".
    /// Ignored when X-Platform: Mobile header is present.
    /// </summary>
    public string? RequestedRole { get; set; }
}

public sealed class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class RefreshTokenRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}

public sealed class VerifyOtpRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public sealed class LogoutRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}

public sealed class UpdateProfileRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }
}

public sealed class ChangePasswordRequestDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public sealed class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public ProfileResponseDto User { get; set; } = new();
}

public sealed class ProfileResponseDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName  { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }
}

/// <summary>
/// Payload sent by the client for Google Sign-In.
/// The client (web/mobile) receives an ID token from Google after the user
/// signs in, then forwards it here for server-side verification.
/// </summary>
public sealed class GoogleLoginRequestDto
{
    /// <summary>
    /// The Google ID token (JWT) returned by the Google Sign-In SDK.
    /// The server validates this token against Google's public keys.
    /// </summary>
    public string IdToken { get; set; } = string.Empty;

    /// <summary>
    /// Optional: requested role.  
    /// Ignored for mobile (X-Platform: Mobile header) — always defaults to Client.
    /// If missing or invalid on web, defaults to Client.
    /// </summary>
    public string? RequestedRole { get; set; }

    /// <summary>Optional phone number — not always provided by Google.</summary>
    public string? PhoneNumber { get; set; }
}

public sealed class ForgotPasswordRequestDto
{
    public string Email { get; set; } = string.Empty;
}

public sealed class ResetPasswordRequestDto
{
    public string Email       { get; set; } = string.Empty;
    public string Token       { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
