using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Application.DTOs.Seller;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Seller;

// ── Existing records ──
public sealed record GetMyProductsQuery(string SellerId);
public sealed record AddMyProductCommand(string SellerId, AddSellerProductDto Request);
public sealed record UpdateMyProductCommand(string SellerId, Guid ProductId, UpdateSellerProductDto Request);
public sealed record DeleteMyProductCommand(string SellerId, Guid ProductId);
public sealed record GetMyOrdersAsSellerQuery(string SellerId);

// ── New records ──
public sealed record GetSellerDashboardQuery(string SellerId);
public sealed record GetSellerOrderStatsQuery(string SellerId);
public sealed record GetSellerAnalyticsQuery(string SellerId);
public sealed record GetSellerStoreProfileQuery(string SellerId);
public sealed record UpdateSellerStoreCommand(string SellerId, UpdateSellerStoreDto Request);
public sealed record GetSellerReviewsQuery(string SellerId);
public sealed record GetSellerSettingsQuery(string SellerId);
public sealed record UpdateSellerSettingsCommand(string SellerId, UpdateSellerSettingsDto Request);
public sealed record PrepareOrderCommand(string SellerId, Guid OrderId);
public sealed record RestockProductCommand(string SellerId, Guid ProductId, int Quantity);

// ════ EXISTING HANDLERS ════

public sealed class GetMyProductsQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetMyProductsQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<SellerProductDto>>> Handle(GetMyProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _repo.GetProductsBySellerAsync(request.SellerId, cancellationToken);
        return Result<IReadOnlyList<SellerProductDto>>.Success(products.Select(x => new SellerProductDto
        {
            Id            = x.Id,
            Name          = x.Name,
            Description   = x.Description,
            Price         = x.Price,
            StockQuantity = x.StockQuantity,
            ImageUrl      = x.ImageUrl,
            CategoryId    = x.CategoryId
        }).ToList(), 200);
    }
}

public sealed class AddMyProductCommandHandler
{
    private readonly IStoreRepository _repo;
    public AddMyProductCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<SellerProductDto>> Handle(AddMyProductCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SellerId))
            return Result<SellerProductDto>.Failure(DomainErrors.Common.Validation("Unauthorized: Seller ID is required."), 401);

        // Validate CategoryId exists before saving (prevents FK violation / 500 error)
        var category = await _repo.GetCategoryByIdAsync(request.Request.CategoryId, cancellationToken);
        if (category is null)
            return Result<SellerProductDto>.Failure(
                DomainErrors.Common.Validation($"Category '{request.Request.CategoryId}' does not exist. Use GET /api/store/categories to get valid IDs."), 400);

        var product = new Product
        {
            Id            = Guid.NewGuid(),
            SellerId      = request.SellerId,
            CategoryId    = request.Request.CategoryId,
            Name          = request.Request.Name,
            Description   = request.Request.Description,
            Price         = request.Request.Price,
            StockQuantity = request.Request.StockQuantity,
            ImageUrl      = request.Request.ImageUrl
        };
        await _repo.AddProductAsync(product, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<SellerProductDto>.Success(new SellerProductDto
        {
            Id            = product.Id,
            Name          = product.Name,
            Description   = product.Description,
            Price         = product.Price,
            StockQuantity = product.StockQuantity,
            ImageUrl      = product.ImageUrl,
            CategoryId    = product.CategoryId
        }, 201);
    }
}

public sealed class UpdateMyProductCommandHandler
{
    private readonly IStoreRepository _repo;
    private readonly IFileStorageService _storage;
    public UpdateMyProductCommandHandler(IStoreRepository repo, IFileStorageService storage) 
    { 
        _repo = repo; 
        _storage = storage; 
    }

    public async Task<Result<bool>> Handle(UpdateMyProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _repo.GetProductByIdForSellerAsync(request.ProductId, request.SellerId, cancellationToken);
        if (product is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        // Validate CategoryId exists before saving (prevents FK violation / 500 error)
        if (product.CategoryId != request.Request.CategoryId)
        {
            var category = await _repo.GetCategoryByIdAsync(request.Request.CategoryId, cancellationToken);
            if (category is null)
                return Result<bool>.Failure(
                    DomainErrors.Common.Validation($"Category '{request.Request.CategoryId}' does not exist. Use GET /api/store/categories to get valid IDs."), 400);
        }

        string? oldImageUrl = null;
        if (request.Request.ImageUrl != product.ImageUrl)
        {
            oldImageUrl = product.ImageUrl;
        }

        product.CategoryId    = request.Request.CategoryId;
        product.Name          = request.Request.Name;
        product.Description   = request.Request.Description;
        product.Price         = request.Request.Price;
        product.StockQuantity = request.Request.StockQuantity;
        product.ImageUrl      = request.Request.ImageUrl;
        product.UpdatedOnUtc  = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(oldImageUrl))
        {
            await _storage.DeleteAsync(oldImageUrl, cancellationToken);
        }

        return Result<bool>.Success(true, 200);
    }
}

public sealed class DeleteMyProductCommandHandler
{
    private readonly IStoreRepository _repo;
    private readonly IFileStorageService _storage;
    public DeleteMyProductCommandHandler(IStoreRepository repo, IFileStorageService storage) 
    { 
        _repo = repo; 
        _storage = storage; 
    }

    public async Task<Result<bool>> Handle(DeleteMyProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _repo.GetProductByIdForSellerAsync(request.ProductId, request.SellerId, cancellationToken);
        if (product is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);
        
        string? oldImageUrl = product.ImageUrl;

        _repo.RemoveProduct(product);
        await _repo.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(oldImageUrl))
        {
            await _storage.DeleteAsync(oldImageUrl, cancellationToken);
        }

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
            Status  = x.Status,
            Total   = x.TotalAmount
        }).ToList(), 200);
    }
}

// ════ NEW HANDLERS ════

/// <summary>GET /api/seller/dashboard</summary>
public sealed class GetSellerDashboardQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetSellerDashboardQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<SellerDashboardDto>> Handle(GetSellerDashboardQuery request, CancellationToken cancellationToken)
    {
        var products = await _repo.GetProductsBySellerAsync(request.SellerId, cancellationToken);
        var orders   = await _repo.GetOrdersBySellerAsync(request.SellerId, cancellationToken);

        var dto = new SellerDashboardDto
        {
            TotalProducts = products.Count,
            TotalOrders   = orders.Count,
            TotalRevenue  = orders.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => o.TotalAmount),
            PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
            RecentOrders  = orders.Take(5).Select(o => new SellerOrderDto
            {
                OrderId = o.Id,
                Status  = o.Status,
                Total   = o.TotalAmount
            }).ToList()
        };

        return Result<SellerDashboardDto>.Success(dto, 200);
    }
}

/// <summary>GET /api/seller/orders/stats</summary>
public sealed class GetSellerOrderStatsQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetSellerOrderStatsQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<SellerOrderStatsDto>> Handle(GetSellerOrderStatsQuery request, CancellationToken cancellationToken)
    {
        var orders = await _repo.GetOrdersBySellerAsync(request.SellerId, cancellationToken);
        return Result<SellerOrderStatsDto>.Success(new SellerOrderStatsDto
        {
            Pending    = orders.Count(o => o.Status == OrderStatus.Pending),
            Processing = orders.Count(o => o.Status == OrderStatus.Processing),
            Completed  = orders.Count(o => o.Status == OrderStatus.Delivered),
            Cancelled  = orders.Count(o => o.Status == OrderStatus.Cancelled)
        }, 200);
    }
}

/// <summary>GET /api/seller/analytics — monthly revenue for last 6 months</summary>
public sealed class GetSellerAnalyticsQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetSellerAnalyticsQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<SellerAnalyticsMonthDto>>> Handle(GetSellerAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var orders  = await _repo.GetOrdersBySellerAsync(request.SellerId, cancellationToken);
        var now     = DateTime.UtcNow;

        var data = Enumerable.Range(0, 6)
            .Select(i =>
            {
                var target  = now.AddMonths(-i);
                var monthly = orders.Where(o =>
                    o.CreatedOnUtc.Year  == target.Year &&
                    o.CreatedOnUtc.Month == target.Month).ToList();

                return new SellerAnalyticsMonthDto
                {
                    Month   = target.ToString("MMM yyyy"),
                    Revenue = monthly.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => o.TotalAmount),
                    Orders  = monthly.Count
                };
            })
            .OrderBy(x => x.Month)   // chronological
            .ToList<SellerAnalyticsMonthDto>();

        return Result<IReadOnlyList<SellerAnalyticsMonthDto>>.Success(data, 200);
    }
}

/// <summary>GET /api/seller/store — store profile derived from seller user + aggregated stats</summary>
public sealed class GetSellerStoreProfileQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IStoreRepository             _repo;

    public GetSellerStoreProfileQueryHandler(UserManager<ApplicationUser> userManager, IStoreRepository repo)
    {
        _userManager = userManager;
        _repo        = repo;
    }

    public async Task<Result<SellerStoreProfileDto>> Handle(GetSellerStoreProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.SellerId);
        if (user is null) return Result<SellerStoreProfileDto>.Failure(DomainErrors.Common.NotFound, 404);

        var orders = await _repo.GetOrdersBySellerAsync(request.SellerId, cancellationToken);

        return Result<SellerStoreProfileDto>.Success(new SellerStoreProfileDto
        {
            Name        = $"{user.FirstName} {user.LastName}".Trim(),
            Description = user.Address,       // reuse Address as store description (simple approach)
            Logo        = user.ProfilePicture,
            Rating      = 0,                  // wire up Ratings repo when ready
            TotalSales  = orders.Count(o => o.Status == OrderStatus.Delivered)
        }, 200);
    }
}

/// <summary>PUT /api/seller/store — update store name/description/logo on the user record</summary>
public sealed class UpdateSellerStoreCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public UpdateSellerStoreCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(UpdateSellerStoreCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.SellerId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        var names = request.Request.Name.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        user.FirstName      = names.Length > 0 ? names[0] : user.FirstName;
        user.LastName       = names.Length > 1 ? names[1] : string.Empty;
        user.Address        = request.Request.Description;
        user.ProfilePicture = request.Request.Logo;

        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}

/// <summary>GET /api/seller/reviews</summary>
public sealed class GetSellerReviewsQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetSellerReviewsQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<SellerReviewDto>>> Handle(GetSellerReviewsQuery request, CancellationToken cancellationToken)
    {
        var ratings = await _repo.GetRatingsBySellerAsync(request.SellerId, cancellationToken);

        var reviews = ratings.Select(r =>
        {
            // pick the first product in the order that belongs to this seller
            var productName = r.Order?.OrderItems
                .FirstOrDefault(oi => oi.Product.SellerId == request.SellerId)
                ?.Product.Name ?? string.Empty;

            return new SellerReviewDto
            {
                Id           = r.Id,
                CustomerName = r.User is null ? string.Empty : $"{r.User.FirstName} {r.User.LastName}".Trim(),
                Stars        = r.Stars,
                Comment      = r.Comment,
                Date         = r.CreatedAtUtc,
                ProductName  = productName
            };
        }).ToList<SellerReviewDto>();

        return Result<IReadOnlyList<SellerReviewDto>>.Success(reviews, 200);
    }
}

/// <summary>GET /api/seller/settings — settings stored in user.Address field (JSON-lite format)</summary>
public sealed class GetSellerSettingsQueryHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public GetSellerSettingsQueryHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<SellerSettingsDto>> Handle(GetSellerSettingsQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.SellerId);
        if (user is null) return Result<SellerSettingsDto>.Failure(DomainErrors.Common.NotFound, 404);

        // Settings stored as "email:1|sms:0|auto:1" in PhoneNumber's suffix — we use Points field as a bitmask
        // 0b001 = EmailNotifications, 0b010 = SmsNotifications, 0b100 = AutoAcceptOrders
        var flags = user.Points;
        return Result<SellerSettingsDto>.Success(new SellerSettingsDto
        {
            EmailNotifications = (flags & 1) != 0,
            SmsNotifications   = (flags & 2) != 0,
            AutoAcceptOrders   = (flags & 4) != 0
        }, 200);
    }
}

/// <summary>PUT /api/seller/settings</summary>
public sealed class UpdateSellerSettingsCommandHandler
{
    private readonly UserManager<ApplicationUser> _userManager;
    public UpdateSellerSettingsCommandHandler(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<Result<bool>> Handle(UpdateSellerSettingsCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.SellerId);
        if (user is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        // Pack into bitmask in Points field
        var dto   = request.Request;
        user.Points = (dto.EmailNotifications ? 1 : 0)
                    | (dto.SmsNotifications   ? 2 : 0)
                    | (dto.AutoAcceptOrders   ? 4 : 0);

        await _userManager.UpdateAsync(user);
        return Result<bool>.Success(true, 200);
    }
}

/// <summary>POST /api/seller/orders/{id}/prepare — advances order to Processing</summary>
public sealed class PrepareOrderCommandHandler
{
    private readonly IStoreRepository _repo;
    public PrepareOrderCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(PrepareOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _repo.GetOrderByIdForSellerAsync(request.OrderId, request.SellerId, cancellationToken);
        if (order is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        if (order.Status != OrderStatus.Pending)
            return Result<bool>.Failure(DomainErrors.Common.Validation("Order can only be prepared when in Pending state."), 400);

        order.Status       = OrderStatus.Processing;
        order.UpdatedOnUtc = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

/// <summary>POST /api/seller/products/{id}/restock — increases stock quantity</summary>
public sealed class RestockProductCommandHandler
{
    private readonly IStoreRepository _repo;
    public RestockProductCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(RestockProductCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
            return Result<bool>.Failure(DomainErrors.Common.Validation("Quantity must be greater than zero."), 400);

        var product = await _repo.GetProductByIdForSellerAsync(request.ProductId, request.SellerId, cancellationToken);
        if (product is null) return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        product.StockQuantity += request.Quantity;
        product.UpdatedOnUtc   = DateTime.UtcNow;
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}
