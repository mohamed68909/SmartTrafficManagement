using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles);

    RefreshToken GenerateRefreshToken(string userId);
}
