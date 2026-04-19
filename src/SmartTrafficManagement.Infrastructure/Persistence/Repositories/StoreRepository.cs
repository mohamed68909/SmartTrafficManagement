namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class StoreRepository : IStoreRepository
{
    private readonly ApplicationDbContext _dbContext;

    public StoreRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Product>> GetProductsAsync(
        int pageNumber, int pageSize,
        string? search, Guid? categoryId,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p =>
                p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search)));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        return await query
            .OrderBy(x => x.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountProductsAsync(
        string? search, Guid? categoryId,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p =>
                p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search)));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async Task<Product?> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products.FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);
    }

    public async Task<CartItem?> GetCartItemAsync(string userId, Guid productId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CartItems.FirstOrDefaultAsync(
            x => x.UserId == userId && x.ProductId == productId,
            cancellationToken);
    }

    public async Task<IReadOnlyList<CartItem>> GetCartItemsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CartItems
            .AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddCartItemAsync(CartItem cartItem, CancellationToken cancellationToken = default)
    {
        await _dbContext.CartItems.AddAsync(cartItem, cancellationToken);
    }

    public async Task<CartItem?> GetCartItemByIdAsync(Guid cartItemId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CartItems
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == cartItemId && x.UserId == userId, cancellationToken);
    }

    public void RemoveCartItems(IReadOnlyList<CartItem> cartItems)
    {
        _dbContext.CartItems.RemoveRange(cartItems);
    }

    public void RemoveCartItem(CartItem cartItem)
    {
        _dbContext.CartItems.Remove(cartItem);
    }

    public async Task AddOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _dbContext.Orders.AddAsync(order, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetOrdersByUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Order?> GetOrderByIdAsync(Guid orderId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .AsNoTracking()
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.UserId == userId, cancellationToken);
    }

    public async Task<Order?> GetOrderByPaymentIntentIdAsync(string paymentIntentId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders.FirstOrDefaultAsync(x => x.PaymentIntentId == paymentIntentId, cancellationToken);
    }

    public async Task<int> CountOrdersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders.CountAsync(cancellationToken);
    }

    public async Task<decimal> SumPaidOrdersTotalAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .Where(x => x.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(x => (decimal?)x.TotalAmount, cancellationToken) ?? 0m;
    }

    public async Task<IReadOnlyList<Order>> GetOrdersBetweenAsync(DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .AsNoTracking()
            .Where(x => x.CreatedOnUtc >= fromUtc && x.CreatedOnUtc < toUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetProductsBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .AsNoTracking()
            .Where(x => x.SellerId == sellerId)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _dbContext.Products.AddAsync(product, cancellationToken);
    }

    public async Task<Product?> GetProductByIdForSellerAsync(Guid productId, string sellerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products.FirstOrDefaultAsync(x => x.Id == productId && x.SellerId == sellerId, cancellationToken);
    }

    public void RemoveProduct(Product product)
    {
        _dbContext.Products.Remove(product);
    }

    public async Task<IReadOnlyList<Order>> GetOrdersBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .AsNoTracking()
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.Product)
            .Where(x => x.OrderItems.Any(oi => oi.Product.SellerId == sellerId))
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Order?> GetOrderByIdForSellerAsync(Guid orderId, string sellerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.Product)
            .Include(x => x.User)
            .FirstOrDefaultAsync(
                x => x.Id == orderId && x.OrderItems.Any(oi => oi.Product.SellerId == sellerId),
                cancellationToken);
    }

    public async Task<IReadOnlyList<Rating>> GetRatingsBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        // ratings linked to orders that contain at least one product from this seller
        return await _dbContext.Ratings
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Order)
                .ThenInclude(o => o!.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(r => r.OrderId != null &&
                        r.Order!.OrderItems.Any(oi => oi.Product.SellerId == sellerId))
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Rating>> GetAllRatingsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ratings
            .AsNoTracking()
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
