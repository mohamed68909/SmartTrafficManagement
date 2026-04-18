using FluentValidation;
using SmartTrafficManagement.Application.DTOs.Auth;

namespace SmartTrafficManagement.Application.Validators.Auth;

public sealed class RegisterRequestDtoValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestDtoValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.RequestedRole)
            .Must(role => role is null ||
                          role == "Client" ||
                          role == "Provider" ||
                          role == "Seller")
            .WithMessage("RequestedRole must be Client, Provider, or Seller if provided.");
    }
}

public sealed class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class RefreshTokenRequestDtoValidator : AbstractValidator<RefreshTokenRequestDto>
{
    public RefreshTokenRequestDtoValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public sealed class UpdateProfileRequestDtoValidator : AbstractValidator<UpdateProfileRequestDto>
{
    public UpdateProfileRequestDtoValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.ProfilePicture)
            .Must(BeValidImageReference)
            .When(x => !string.IsNullOrWhiteSpace(x.ProfilePicture))
            .WithMessage("ProfilePicture must be a valid URL or base64 image string.");
    }

    private static bool BeValidImageReference(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        if (Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
        {
            return true;
        }

        var payload = value.Contains(',', StringComparison.Ordinal)
            ? value.Split(',', 2)[1]
            : value;

        return Convert.TryFromBase64String(payload, new Span<byte>(new byte[payload.Length]), out _);
    }
}

public sealed class ChangePasswordRequestDtoValidator : AbstractValidator<ChangePasswordRequestDto>
{
    public ChangePasswordRequestDtoValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
    }
}

public sealed class VerifyOtpRequestDtoValidator : AbstractValidator<VerifyOtpRequestDto>
{
    public VerifyOtpRequestDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.OtpCode).NotEmpty().Length(4, 8);
    }
}

public sealed class LogoutRequestDtoValidator : AbstractValidator<LogoutRequestDto>
{
    public LogoutRequestDtoValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
