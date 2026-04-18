using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs.Auth;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Application.Features.Auth.Queries;

public sealed record GetProfileQuery(string UserId);

public sealed class GetProfileQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;

    public GetProfileQueryHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<ProfileResponseDto>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return Result<ProfileResponseDto>.Failure(DomainErrors.Common.NotFound, 404);
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Result<ProfileResponseDto>.Success(new ProfileResponseDto
        {
            Id = Guid.Parse(user.Id),
            FirstName = user.FirstName,
            LastName  = user.LastName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            Points = user.Points,
            Role = roles.FirstOrDefault() ?? string.Empty,
            ProfilePicture = user.ProfilePicture,
            Address = user.Address
        }, 200);
    }
}
