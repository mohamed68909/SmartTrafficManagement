using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IPaymentManagementService
{
    Task<UserCard> AddCardAsync(string userId, string paymentMethodId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UserCard>> GetSavedCardsAsync(string userId, CancellationToken cancellationToken = default);

    Task<bool> DeleteCardAsync(string userId, string paymentMethodId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Transaction>> GetPaymentHistoryAsync(string userId, CancellationToken cancellationToken = default);

    Task<Transaction?> GetPaymentByIdAsync(string userId, Guid transactionId, CancellationToken cancellationToken = default);

    Task<(string RefundId, string Status, decimal Amount, string Currency)> RefundPaymentAsync(
        string userId,
        string paymentIntentId,
        decimal? amount,
        CancellationToken cancellationToken = default);
}
