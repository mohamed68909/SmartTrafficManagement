using FluentValidation;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.RefreshToken;

public sealed class RefreshTokenCommand
{
    public string RefreshToken { get; set; } = string.Empty;
}

public sealed class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public sealed class RefreshTokenCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IValidator<RefreshTokenCommand> _validator;

    public RefreshTokenCommandHandler(
        IAuthRepository authRepository,
        UserManager<ApplicationUser> userManager,
        IJwtTokenService jwtTokenService,
        IValidator<RefreshTokenCommand> validator)
    {
        _authRepository = authRepository;
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _validator = validator;
    }

    public async Task<Result<AuthResponseDto>> HandleAsync(RefreshTokenCommand command, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<AuthResponseDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var existingToken = await _authRepository.GetActiveRefreshTokenAsync(command.RefreshToken, cancellationToken);
        if (existingToken is null || !existingToken.IsActive)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.InvalidCredentials, 401);
        }

        existingToken.RevokedOnUtc = DateTime.UtcNow;

        var user = existingToken.User;
        var roles = await _userManager.GetRolesAsync(user);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

        await _authRepository.AddRefreshTokenAsync(newRefreshToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Token = _jwtTokenService.GenerateAccessToken(user, roles),
            RefreshToken = newRefreshToken.Token
        };

        return Result<AuthResponseDto>.Success(response, 200);
    }
}
