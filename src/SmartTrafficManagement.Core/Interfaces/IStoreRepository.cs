using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IStoreRepository
{
    Task<IReadOnlyList<Product>> GetProductsAsync(
        int pageNumber, int pageSize,
        string? search, Guid? categoryId,
        CancellationToken cancellationToken = default);

    Task<int> CountProductsAsync(
        string? search, Guid? categoryId,
        CancellationToken cancellationToken = default);

    Task<Product?> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default);

    Task<CartItem?> GetCartItemAsync(string userId, Guid productId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CartItem>> GetCartItemsAsync(string userId, CancellationToken cancellationToken = default);

    Task AddCartItemAsync(CartItem cartItem, CancellationToken cancellationToken = default);

    Task<CartItem?> GetCartItemByIdAsync(Guid cartItemId, string userId, CancellationToken cancellationToken = default);

    void RemoveCartItems(IReadOnlyList<CartItem> cartItems);

    void RemoveCartItem(CartItem cartItem);

    Task AddOrderAsync(Order order, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Order>> GetOrdersByUserAsync(string userId, CancellationToken cancellationToken = default);

    Task<Order?> GetOrderByIdAsync(Guid orderId, string userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Product>> GetProductsBySellerAsync(string sellerId, CancellationToken cancellationToken = default);

    Task AddProductAsync(Product product, CancellationToken cancellationToken = default);

    Task<Product?> GetProductByIdForSellerAsync(Guid productId, string sellerId, CancellationToken cancellationToken = default);

    void RemoveProduct(Product product);

    Task<IReadOnlyList<Order>> GetOrdersBySellerAsync(string sellerId, CancellationToken cancellationToken = default);

    Task<Order?> GetOrderByPaymentIntentIdAsync(string paymentIntentId, CancellationToken cancellationToken = default);

    Task<int> CountOrdersAsync(CancellationToken cancellationToken = default);

    Task<decimal> SumPaidOrdersTotalAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Order>> GetOrdersBetweenAsync(DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken = default);

    /// <summary>Fetch a single order by id, ensuring it contains at least one item belonging to this seller.</summary>
    Task<Order?> GetOrderByIdForSellerAsync(Guid orderId, string sellerId, CancellationToken cancellationToken = default);

    /// <summary>Returns all ratings for orders that contain products belonging to the given seller.</summary>
    Task<IReadOnlyList<Rating>> GetRatingsBySellerAsync(string sellerId, CancellationToken cancellationToken = default);

    /// <summary>Returns all ratings (with User) for admin overview.</summary>
    Task<IReadOnlyList<Rating>> GetAllRatingsAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns all active (non-deleted) categories ordered by name.</summary>
    Task<IReadOnlyList<Category>> GetCategoriesAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns a single category by id, or null if not found / soft-deleted.</summary>
    Task<Category?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddCategoryAsync(Category category, CancellationToken cancellationToken = default);

    void RemoveCategory(Category category);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
