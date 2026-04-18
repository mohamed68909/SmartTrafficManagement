using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SmartTrafficManagement.Infrastructure.Services;

/// <summary>
/// Verifies Google ID tokens using Google.Apis.Auth library.
/// The library downloads Google's public keys and validates the token signature,
/// expiry, audience, and issuer — no manual JWKS parsing required.
/// </summary>
public sealed class GoogleTokenVerifier : IGoogleTokenVerifier
{
    private readonly string _clientId;
    private readonly ILogger<GoogleTokenVerifier> _logger;

    public GoogleTokenVerifier(IConfiguration configuration, ILogger<GoogleTokenVerifier> logger)
    {
        _clientId = configuration["Google:ClientId"] ?? string.Empty;
        _logger = logger;
    }

    public async Task<GoogleTokenPayload?> VerifyAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
            return null;

        if (string.IsNullOrWhiteSpace(_clientId))
        {
            _logger.LogError("Google:ClientId is not configured. Cannot verify Google ID token.");
            return null;
        }

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _clientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            // Split name — Google sends "given_name" and "family_name" in standard claims
            var firstName = payload.GivenName ?? string.Empty;
            var lastName  = payload.FamilyName ?? string.Empty;

            // Fallback: if given/family names are missing, split the full Name
            if (string.IsNullOrWhiteSpace(firstName) && !string.IsNullOrWhiteSpace(payload.Name))
            {
                var parts = payload.Name.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                firstName = parts.Length > 0 ? parts[0] : string.Empty;
                lastName  = parts.Length > 1 ? parts[1] : string.Empty;
            }

            return new GoogleTokenPayload(
                Subject:    payload.Subject,
                Email:      payload.Email,
                FirstName:  firstName,
                LastName:   lastName,
                PictureUrl: payload.Picture);
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Google ID token validation failed: {Message}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while verifying Google ID token.");
            return null;
        }
    }
}
