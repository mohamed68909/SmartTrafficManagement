using SmartTrafficManagement.Application.DTOs.Seller;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Seller;

public sealed record GetMyProductsQuery(string SellerId);
public sealed record AddMyProductCommand(string SellerId, AddSellerProductDto Request);
public sealed record UpdateMyProductCommand(string SellerId, Guid ProductId, UpdateSellerProductDto Request);
public sealed record DeleteMyProductCommand(string SellerId, Guid ProductId);
public sealed record GetMyOrdersAsSellerQuery(string SellerId);

public sealed class GetMyProductsQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetMyProductsQueryHandler(IStoreRepository repo) => _repo = repo;
    public async Task<Result<IReadOnlyList<SellerProductDto>>> Handle(GetMyProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _repo.GetProductsBySellerAsync(request.SellerId, cancellationToken);
        return Result<IReadOnlyList<SellerProductDto>>.Success(products.Select(x => new SellerProductDto
        {
            Id = x.Id,
            Name = x.Name,
            Price = x.Price,
            StockQuantity = x.StockQuantity
        }).ToList(), 200);
    }
}

public sealed class AddMyProductCommandHandler
{
    private readonly IStoreRepository _repo;
    public AddMyProductCommandHandler(IStoreRepository repo) => _repo = repo;
    public async Task<Result<SellerProductDto>> Handle(AddMyProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            SellerId = request.SellerId,
            CategoryId = request.Request.CategoryId,
            Name = request.Request.Name,
            Description = request.Request.Description,
            Price = request.Request.Price,
            StockQuantity = request.Request.StockQuantity
        };
        await _repo.AddProductAsync(product, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<SellerProductDto>.Success(new SellerProductDto { Id = product.Id, Name = product.Name, Price = product.Price, StockQuantity = product.StockQuantity }, 201);
    }
}

public sealed class UpdateMyProductCommandHandler
{
    private readonly IStoreRepository _repo;
    public UpdateMyProductCommandHandler(IStoreRepository repo) => _repo = repo;
    public async Task<Result<bool>> Handle(UpdateMyProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _repo.GetProductByIdForSellerAsync(request.ProductId, request.SellerId, cancellationToken);
        if (product is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);
        product.CategoryId = request.Request.CategoryId;
        product.Name = request.Request.Name;
        product.Description = request.Request.Description;
        product.Price = request.Request.Price;
        product.StockQuantity = request.Request.StockQuantity;
        product.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

public sealed class DeleteMyProductCommandHandler
{
    private readonly IStoreRepository _repo;
    public DeleteMyProductCommandHandler(IStoreRepository repo) => _repo = repo;
    public async Task<Result<bool>> Handle(DeleteMyProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _repo.GetProductByIdForSellerAsync(request.ProductId, request.SellerId, cancellationToken);
        if (product is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);
        _repo.RemoveProduct(product);
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

public sealed class GetMyOrdersAsSellerQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetMyOrdersAsSellerQueryHandler(IStoreRepository repo) => _repo = repo;
    public async Task<Result<IReadOnlyList<SellerOrderDto>>> Handle(GetMyOrdersAsSellerQuery request, CancellationToken cancellationToken)
    {
        var orders = await _repo.GetOrdersBySellerAsync(request.SellerId, cancellationToken);
        return Result<IReadOnlyList<SellerOrderDto>>.Success(orders.Select(x => new SellerOrderDto
        {
            OrderId = x.Id,
            Status = x.Status,
            Total = x.TotalAmount
        }).ToList(), 200);
    }
}
