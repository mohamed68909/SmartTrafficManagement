using SmartTrafficManagement.Application.DTOs.Orders;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Orders;

public sealed record GetMyOrdersQuery(string UserId);
public sealed record GetOrderDetailsQuery(string UserId, Guid OrderId);

public sealed class GetMyOrdersQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetMyOrdersQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<OrderSummaryDto>>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _repo.GetOrdersByUserAsync(request.UserId, cancellationToken);
        var payload = orders.Select(x => new OrderSummaryDto
        {
            OrderId = x.Id,
            Status = x.Status,
            PaymentStatus = x.PaymentStatus,
            TotalAmount = x.TotalAmount,
            CreatedAt = x.CreatedOnUtc
        }).ToList();
        return Result<IReadOnlyList<OrderSummaryDto>>.Success(payload, 200);
    }
}

public sealed class GetOrderDetailsQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetOrderDetailsQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<OrderDetailsDto>> Handle(GetOrderDetailsQuery request, CancellationToken cancellationToken)
    {
        var order = await _repo.GetOrderByIdAsync(request.OrderId, request.UserId, cancellationToken);
        if (order is null) return Result<OrderDetailsDto>.Failure(DomainErrors.Common.NotFound, 404);
        return Result<OrderDetailsDto>.Success(new OrderDetailsDto
        {
            OrderId = order.Id,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            TotalAmount = order.TotalAmount,
            CreatedAt = order.CreatedOnUtc,
            Items = order.OrderItems.Select(i => new OrderItemLineDto
            {
                ProductName = i.Product.Name,
                Quantity = i.Quantity,
                Price = i.UnitPrice
            }).ToList()
        }, 200);
    }
}
