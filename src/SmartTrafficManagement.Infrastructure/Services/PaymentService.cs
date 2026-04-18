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
        var options = new PaymentIntentCreateOptions
        {
            Amount = amount,
            Currency = currency
        };

        var intent = await _paymentIntentService.CreateAsync(options, cancellationToken: cancellationToken);
        return (intent.Id, intent.ClientSecret ?? string.Empty);
    }
}
