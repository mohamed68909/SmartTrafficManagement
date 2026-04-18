using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.Login;

public sealed class LoginCommand
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class LoginCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthRepository _authRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IValidator<LoginCommand> _validator;
    private readonly IMapper _mapper;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        IAuthRepository authRepository,
        IJwtTokenService jwtTokenService,
        IValidator<LoginCommand> validator,
        IMapper mapper)
    {
        _userManager = userManager;
        _authRepository = authRepository;
        _jwtTokenService = jwtTokenService;
        _validator = validator;
        _mapper = mapper;
    }

    public async Task<Result<AuthResponseDto>> HandleAsync(LoginCommand command, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<AuthResponseDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var user = await _userManager.FindByEmailAsync(command.Email);
        if (user is null)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.InvalidCredentials, 401);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, command.Password);
        if (!isPasswordValid)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.InvalidCredentials, 401);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);
        await _authRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<AuthResponseDto>(user);
        response.Token = _jwtTokenService.GenerateAccessToken(user, roles);
        response.RefreshToken = refreshToken.Token;

        return Result<AuthResponseDto>.Success(response, 200);
    }
}
