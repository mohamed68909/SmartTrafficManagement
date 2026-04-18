using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.AddToCart;

public sealed class AddToCartCommand
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public sealed class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

public sealed class AddToCartCommandHandler
{
    private readonly IStoreRepository _storeRepository;
    private readonly IValidator<AddToCartCommand> _validator;

    public AddToCartCommandHandler(IStoreRepository storeRepository, IValidator<AddToCartCommand> validator)
    {
        _storeRepository = storeRepository;
        _validator = validator;
    }

    public async Task<Result<CartDto>> HandleAsync(string userId, AddToCartCommand command, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<CartDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<CartDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var product = await _storeRepository.GetProductByIdAsync(command.ProductId, cancellationToken);
        if (product is null)
        {
            return Result<CartDto>.Failure(DomainErrors.Products.ProductNotFound, 404);
        }

        var cartItem = await _storeRepository.GetCartItemAsync(userId, command.ProductId, cancellationToken);
        if (cartItem is null)
        {
            cartItem = new CartItem
            {
                UserId = userId,
                ProductId = command.ProductId,
                Quantity = command.Quantity,
                UnitPrice = product.Price
            };

            await _storeRepository.AddCartItemAsync(cartItem, cancellationToken);
        }
        else
        {
            cartItem.Quantity += command.Quantity;
            cartItem.UpdatedOnUtc = DateTime.UtcNow;
        }

        await _storeRepository.SaveChangesAsync(cancellationToken);

        var items = await _storeRepository.GetCartItemsAsync(userId, cancellationToken);
        var dto = new CartDto
        {
            Items = items.Select(x => new CartItemDto
            {
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                SubTotal = x.UnitPrice * x.Quantity
            }).ToList(),
            TotalAmount = items.Sum(x => x.UnitPrice * x.Quantity)
        };

        return Result<CartDto>.Success(dto, 200);
    }
}
