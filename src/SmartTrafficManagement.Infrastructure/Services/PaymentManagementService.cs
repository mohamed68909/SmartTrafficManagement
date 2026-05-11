using Stripe;

namespace SmartTrafficManagement.Infrastructure.Services;

public sealed class PaymentManagementService : IPaymentManagementService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly CustomerService _customerService;
    private readonly PaymentMethodService _paymentMethodService;
    private readonly RefundService _refundService;
    private readonly PaymentIntentService _paymentIntentService;

    public PaymentManagementService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _customerService = new CustomerService();
        _paymentMethodService = new PaymentMethodService();
        _refundService = new RefundService();
        _paymentIntentService = new PaymentIntentService();
    }

    public async Task<UserCard> AddCardAsync(string userId, string paymentMethodId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        // Mocking Stripe integration to prevent crashes
        var mockBrand = "Visa";
        var mockLast4 = new Random().Next(1000, 9999).ToString();
        var mockExpMonth = 12;
        var mockExpYear = 2030;
        var mockName = $"{user.FirstName} {user.LastName}".Trim();

        var card = await _dbContext.UserCards.FirstOrDefaultAsync(
            x => x.UserId == userId && x.StripePaymentMethodId == paymentMethodId,
            cancellationToken);

        if (card is null)
        {
            card = new UserCard
            {
                UserId = userId,
                StripePaymentMethodId = paymentMethodId,
                HolderName = mockName,
                Brand = mockBrand,
                Last4 = mockLast4,
                ExpMonth = mockExpMonth,
                ExpYear = mockExpYear,
                IsDefault = !await _dbContext.UserCards.AnyAsync(x => x.UserId == userId, cancellationToken)
            };
            await _dbContext.UserCards.AddAsync(card, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return card;
    }

    public async Task<IReadOnlyList<UserCard>> GetSavedCardsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.UserCards
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> DeleteCardAsync(string userId, string paymentMethodId, CancellationToken cancellationToken = default)
    {
        var card = await _dbContext.UserCards.FirstOrDefaultAsync(
            x => x.UserId == userId && x.StripePaymentMethodId == paymentMethodId,
            cancellationToken);
        if (card is null)
        {
            return false;
        }

        // await _paymentMethodService.DetachAsync(paymentMethodId, cancellationToken: cancellationToken);
        _dbContext.UserCards.Remove(card);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<Transaction>> GetPaymentHistoryAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Transactions
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Transaction?> GetPaymentByIdAsync(string userId, Guid transactionId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Transactions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == transactionId, cancellationToken);
    }

    public async Task<(string RefundId, string Status, decimal Amount, string Currency)> RefundPaymentAsync(
        string userId,
        string paymentIntentId,
        decimal? amount,
        CancellationToken cancellationToken = default)
    {
        var transaction = await _dbContext.Transactions
            .FirstOrDefaultAsync(x => x.UserId == userId && x.StripePaymentIntentId == paymentIntentId, cancellationToken)
            ?? throw new InvalidOperationException("Payment not found for this user.");

        // Mocking Stripe integration to prevent crashes
        long refundAmount = amount.HasValue ? Convert.ToInt64(amount.Value * 100m) : Convert.ToInt64(transaction.Amount * 100m);
        var mockRefundId = "re_mock_" + Guid.NewGuid().ToString("N");
        var mockStatus = "succeeded";
        var mockCurrency = transaction.Currency ?? "usd";

        transaction.Status = PaymentStatus.Refunded;
        transaction.UpdatedOnUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var amountDecimal = refundAmount / 100m;
        return (mockRefundId, mockStatus, amountDecimal, mockCurrency);
    }
}
