using FluentValidation;
using SmartTrafficManagement.Application.DTOs.Payments;

namespace SmartTrafficManagement.Application.Validators.Payments;

public sealed class AddPaymentCardRequestDtoValidator : AbstractValidator<AddPaymentCardRequestDto>
{
    public AddPaymentCardRequestDtoValidator()
    {
        RuleFor(x => x.PaymentMethodId).NotEmpty().MaximumLength(120);
    }
}

public sealed class RefundPaymentRequestDtoValidator : AbstractValidator<RefundPaymentRequestDto>
{
    public RefundPaymentRequestDtoValidator()
    {
        RuleFor(x => x.PaymentIntentId).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .When(x => x.Amount.HasValue);
    }
}
