using FluentValidation;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Auth.RevokeToken;

public sealed class RevokeTokenCommand
{
    public string RefreshToken { get; set; } = string.Empty;
}

public sealed class RevokeTokenCommandValidator : AbstractValidator<RevokeTokenCommand>
{
    public RevokeTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public sealed class RevokeTokenCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly IValidator<RevokeTokenCommand> _validator;

    public RevokeTokenCommandHandler(IAuthRepository authRepository, IValidator<RevokeTokenCommand> validator)
    {
        _authRepository = authRepository;
        _validator = validator;
    }

    public async Task<Result<bool>> HandleAsync(RevokeTokenCommand command, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<bool>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var token = await _authRepository.GetActiveRefreshTokenAsync(command.RefreshToken, cancellationToken);
        if (token is null || !token.IsActive)
        {
            return Result<bool>.Failure(DomainErrors.Auth.InvalidCredentials, 401);
        }

        token.RevokedOnUtc = DateTime.UtcNow;
        await _authRepository.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true, 200);
    }
}
