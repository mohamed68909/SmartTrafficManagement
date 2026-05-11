using Stripe;

namespace SmartTrafficManagement.Infrastructure.Services;

public sealed class PaymentService : IPaymentService
{
    private readonly PaymentIntentService _paymentIntentService;

    public PaymentService(PaymentIntentService paymentIntentService)
    {
        _paymentIntentService = paymentIntentService;
    }

    public async Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(
        long amount,
        string currency,
        CancellationToken cancellationToken = default)
    {
        // Mock Stripe to bypass API calls completely
        var mockIntentId = "pi_mock_" + Guid.NewGuid().ToString("N");
        return await Task.FromResult((mockIntentId, mockIntentId + "_secret"));
    }
}
