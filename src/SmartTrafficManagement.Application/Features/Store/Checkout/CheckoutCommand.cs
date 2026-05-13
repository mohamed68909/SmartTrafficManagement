using FluentValidation;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.Checkout;

public sealed class CheckoutCommand
{
    public string Currency { get; set; } = "egp";
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Card;
    // PaymentIntentId no longer accepted from mobile — backend creates it (TASK-03)
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
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IValidator<CheckoutCommand> _validator;

    public CheckoutCommandHandler(
        IStoreRepository storeRepository,
        IPaymentService paymentService,
        UserManager<ApplicationUser> userManager,
        IValidator<CheckoutCommand> validator)
    {
        _storeRepository = storeRepository;
        _paymentService = paymentService;
        _userManager = userManager;
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

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result<CheckoutDto>.Failure(DomainErrors.Common.Unauthorized, 401);
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

        // ── Wallet Balance Check ──────────────────────────────────────────────
        if (command.PaymentMethod == PaymentMethod.Wallet)
        {
            // Conversion: 100 points = 1 EGP
            var requiredPoints = (int)Math.Ceiling(totalAmount * 100);
            if (user.Points < requiredPoints)
            {
                return Result<CheckoutDto>.Failure(
                    "INSUFFICIENT_FUNDS", 
                    $"Insufficient wallet balance. Required: {requiredPoints} points, Available: {user.Points} points.", 
                    400);
            }

            user.Points -= requiredPoints;
            await _userManager.UpdateAsync(user);
        }

        // ── Payment Intent (Card only) ─────────────────────────────────────────
        
        string paymentIntentId = string.Empty;
        string clientSecret    = string.Empty;
        var    paymentStatus   = PaymentStatus.Pending;

        if (command.PaymentMethod == PaymentMethod.Card)
        {
            // Convert decimal EGP to piastres (smallest unit) (long)
            var amountInCents = (long)Math.Ceiling(totalAmount * 100);
            var intent = await _paymentService.CreatePaymentIntentAsync(
                amountInCents,
                command.Currency.ToLowerInvariant(),
                cancellationToken);

            paymentIntentId = intent.PaymentIntentId;
            clientSecret    = intent.ClientSecret;
            
        }
        else if (command.PaymentMethod == PaymentMethod.Wallet)
        {
            
            paymentStatus = PaymentStatus.Paid;
        }
        

        var order = new Order
        {
            UserId          = userId,
            Status          = OrderStatus.Pending,
            PaymentStatus   = paymentStatus,
            PaymentIntentId = paymentIntentId,
            TotalAmount     = totalAmount,
            OrderItems      = cartItems.Select(x => new OrderItem
            {
                ProductId = x.ProductId,
                Quantity  = x.Quantity,
                UnitPrice = x.UnitPrice
            }).ToList()
        };

        await _storeRepository.AddOrderAsync(order, cancellationToken);
        _storeRepository.RemoveCartItems(cartItems);
        await _storeRepository.SaveChangesAsync(cancellationToken);

        var dto = new CheckoutDto
        {
            OrderId         = order.Id,
            TotalAmount     = totalAmount,
            Currency        = command.Currency.ToLowerInvariant(),
            PaymentIntentId = paymentIntentId,
            ClientSecret    = clientSecret   
        };

        return Result<CheckoutDto>.Success(dto, 200);
    }
}


