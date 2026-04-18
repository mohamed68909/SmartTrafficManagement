using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.Webhook;

public sealed class UpdateOrderPaymentStatusCommand
{
    public string PaymentIntentId { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
}

public sealed class UpdateOrderPaymentStatusCommandHandler
{
    private readonly IStoreRepository _storeRepository;

    public UpdateOrderPaymentStatusCommandHandler(IStoreRepository storeRepository)
    {
        _storeRepository = storeRepository;
    }

    public async Task<Result<bool>> HandleAsync(UpdateOrderPaymentStatusCommand command, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(command.PaymentIntentId))
        {
            return Result<bool>.Failure(DomainErrors.Payments.PaymentIntentRequired, 400);
        }

        var order = await _storeRepository.GetOrderByPaymentIntentIdAsync(command.PaymentIntentId, cancellationToken);
        if (order is null)
        {
            return Result<bool>.Failure(DomainErrors.Payments.OrderNotFound, 404);
        }

        if (command.IsPaid)
        {
            order.PaymentStatus = PaymentStatus.Paid;
            order.Status = OrderStatus.Processing;
            order.UpdatedOnUtc = DateTime.UtcNow;
            await _storeRepository.SaveChangesAsync(cancellationToken);
        }

        return Result<bool>.Success(true, 200);
    }
}
