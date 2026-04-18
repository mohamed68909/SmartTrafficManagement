namespace SmartTrafficManagement.Core.Interfaces;

public interface IPaymentService
{
    Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(
        long amount,
        string currency,
        CancellationToken cancellationToken = default);
}
