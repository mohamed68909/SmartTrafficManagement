using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.Register;

public sealed class RegisterCommand
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}

public sealed class RegisterCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthRepository _authRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IValidator<RegisterCommand> _validator;
    private readonly IMapper _mapper;

    public RegisterCommandHandler(
        UserManager<ApplicationUser> userManager,
        IAuthRepository authRepository,
        IJwtTokenService jwtTokenService,
        IValidator<RegisterCommand> validator,
        IMapper mapper)
    {
        _userManager = userManager;
        _authRepository = authRepository;
        _jwtTokenService = jwtTokenService;
        _validator = validator;
        _mapper = mapper;
    }

    public async Task<Result<AuthResponseDto>> HandleAsync(RegisterCommand command, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<AuthResponseDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var existingUser = await _userManager.FindByEmailAsync(command.Email);
        if (existingUser is not null)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.EmailAlreadyExists, 409);
        }

        var user = new ApplicationUser
        {
            UserName = command.Email,
            Email = command.Email,
            FirstName = command.FirstName,
            LastName = command.LastName,
            Points = 0
        };

        var identityResult = await _userManager.CreateAsync(user, command.Password);
        if (!identityResult.Succeeded)
        {
            return Result<AuthResponseDto>.Failure(DomainErrors.Auth.IdentityOperationFailed, 400);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);
        await _authRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);
        await _authRepository.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<AuthResponseDto>(user);
        response.Token = _jwtTokenService.GenerateAccessToken(user, roles);
        response.RefreshToken = refreshToken.Token;

        return Result<AuthResponseDto>.Success(response, 201);
    }
}
