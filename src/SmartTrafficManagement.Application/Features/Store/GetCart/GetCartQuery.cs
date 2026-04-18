using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.GetCart;

public sealed class GetCartQueryHandler
{
    private readonly IStoreRepository _storeRepository;

    public GetCartQueryHandler(IStoreRepository storeRepository)
    {
        _storeRepository = storeRepository;
    }

    public async Task<Result<CartDto>> HandleAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<CartDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

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
