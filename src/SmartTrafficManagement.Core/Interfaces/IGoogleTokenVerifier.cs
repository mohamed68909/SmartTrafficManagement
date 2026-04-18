namespace SmartTrafficManagement.Core.Interfaces;

/// <summary>
/// Represents the verified claims extracted from a Google ID token.
/// </summary>
public sealed record GoogleTokenPayload(
    string Subject,       // Google user ID (sub claim)
    string Email,
    string FirstName,
    string LastName,
    string? PictureUrl);

/// <summary>
/// Verifies a Google ID token against Google's public keys.
/// </summary>
public interface IGoogleTokenVerifier
{
    /// <summary>
    /// Validates the given ID token and returns its payload.
    /// Returns null if the token is invalid or expired.
    /// </summary>
    Task<GoogleTokenPayload?> VerifyAsync(string idToken, CancellationToken cancellationToken = default);
}
