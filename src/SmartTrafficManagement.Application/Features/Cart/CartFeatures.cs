using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Cart;

public sealed record UpdateCartQuantityCommand(string UserId, Guid CartItemId, int Quantity);
public sealed record RemoveCartItemCommand(string UserId, Guid CartItemId);

public sealed class UpdateCartQuantityCommandHandler
{
    private readonly IStoreRepository _repo;
    public UpdateCartQuantityCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<CartDto>> Handle(UpdateCartQuantityCommand request, CancellationToken cancellationToken)
    {
        var item = await _repo.GetCartItemByIdAsync(request.CartItemId, request.UserId, cancellationToken);
        if (item is null) return Result<CartDto>.Failure(DomainErrors.Common.NotFound, 404);
        if (request.Quantity <= 0) return Result<CartDto>.Failure(DomainErrors.Common.Validation("Quantity must be greater than zero."), 400);
        item.Quantity = request.Quantity;
        item.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);

        var items = await _repo.GetCartItemsAsync(request.UserId, cancellationToken);
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

public sealed class RemoveCartItemCommandHandler
{
    private readonly IStoreRepository _repo;
    public RemoveCartItemCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _repo.GetCartItemByIdAsync(request.CartItemId, request.UserId, cancellationToken);
        if (item is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);
        _repo.RemoveCartItem(item);
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}
