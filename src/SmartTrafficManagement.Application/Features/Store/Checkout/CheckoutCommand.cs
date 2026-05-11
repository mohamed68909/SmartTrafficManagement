using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.Checkout;

public sealed class CheckoutCommand
{
    public string Currency { get; set; } = "usd";
}

public sealed class CheckoutCommandValidator : AbstractValidator<CheckoutCommand>
{
    public CheckoutCommandValidator()
    {
        RuleFor(x => x.Currency).NotEmpty().Length(3, 10);
    }
}

public sealed class CheckoutCommandHandler
{
    private readonly IStoreRepository _storeRepository;
    private readonly IPaymentService _paymentService;
    private readonly IValidator<CheckoutCommand> _validator;

    public CheckoutCommandHandler(
        IStoreRepository storeRepository,
        IPaymentService paymentService,
        IValidator<CheckoutCommand> validator)
    {
        _storeRepository = storeRepository;
        _paymentService = paymentService;
        _validator = validator;
    }

    public async Task<Result<CheckoutDto>> HandleAsync(string userId, CheckoutCommand command, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<CheckoutDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<CheckoutDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var cartItems = await _storeRepository.GetCartItemsAsync(userId, cancellationToken);
        if (cartItems.Count == 0)
        {
            return Result<CheckoutDto>.Failure(DomainErrors.Orders.EmptyCart, 400);
        }

        var totalAmount = cartItems.Sum(x => x.UnitPrice * x.Quantity);
        if (totalAmount <= 0)
        {
            return Result<CheckoutDto>.Failure(DomainErrors.Orders.InvalidTotal, 400);
        }

        var stripeAmount = (long)Math.Round(totalAmount * 100, MidpointRounding.AwayFromZero);
        var (paymentIntentId, clientSecret) = await _paymentService.CreatePaymentIntentAsync(
            stripeAmount,
            command.Currency.ToLowerInvariant(),
            cancellationToken);

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Paid, // Mocked to Paid directly
            PaymentIntentId = paymentIntentId,
            TotalAmount = totalAmount,
            OrderItems = cartItems.Select(x => new OrderItem
            {
                ProductId = x.ProductId,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice
            }).ToList()
        };

        await _storeRepository.AddOrderAsync(order, cancellationToken);
        _storeRepository.RemoveCartItems(cartItems);
        await _storeRepository.SaveChangesAsync(cancellationToken);

        var dto = new CheckoutDto
        {
            OrderId = order.Id,
            TotalAmount = totalAmount,
            Currency = command.Currency.ToLowerInvariant(),
            PaymentIntentId = paymentIntentId,
            ClientSecret = clientSecret
        };

        return Result<CheckoutDto>.Success(dto, 200);
    }
}
