using FluentValidation;
using SmartTrafficManagement.Application.Validators.Auth;

namespace SmartTrafficManagement.Application.Features.Auth.Commands;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new RegisterRequestDtoValidator());
    }
}

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new LoginRequestDtoValidator());
    }
}

public sealed class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new RefreshTokenRequestDtoValidator());
    }
}

public sealed class LogoutCommandValidator : AbstractValidator<LogoutCommand>
{
    public LogoutCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new LogoutRequestDtoValidator());
    }
}

public sealed class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
{
    public VerifyOtpCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new VerifyOtpRequestDtoValidator());
    }
}

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Request).SetValidator(new UpdateProfileRequestDtoValidator());
    }
}

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Request).SetValidator(new ChangePasswordRequestDtoValidator());
    }
}
