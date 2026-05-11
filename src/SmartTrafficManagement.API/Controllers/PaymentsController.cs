using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SmartTrafficManagement.Application.DTOs.Payments;
using SmartTrafficManagement.Application.Features.Store.Webhook;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;
using Stripe;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Route("api/payments")]
public sealed class PaymentsController : BaseController
{
    [AllowAnonymous]
    [HttpGet("stripe/config")]
    [ProducesResponseType(typeof(Result<StripeConfigDto>), StatusCodes.Status200OK)]
    public IActionResult GetStripeConfig([FromServices] IConfiguration configuration)
    {
        var publishableKey = configuration["Stripe:PublishableKey"] ?? string.Empty;
        return Ok(Result<StripeConfigDto>.Success(new StripeConfigDto { PublishableKey = publishableKey }, 200));
    }

    [AllowAnonymous]
    [HttpPost("stripe/webhook")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> StripeWebhook(
        [FromServices] IConfiguration configuration,
        [FromServices] UpdateOrderPaymentStatusCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var payload = await new StreamReader(Request.Body).ReadToEndAsync(cancellationToken);
        var signatureHeader = Request.Headers["Stripe-Signature"];
        var webhookSecret = configuration["Stripe:WebhookSecret"] ?? string.Empty;

        Event stripeEvent;
        try
        {
            if (!string.IsNullOrWhiteSpace(webhookSecret))
            {
                // ── Production path: verify Stripe signature ──────────────────────
                // Stripe signs every webhook request with HMAC-SHA256.
                // Get the secret from: Stripe Dashboard → Webhooks → Signing secret
                // or via Stripe CLI:   stripe listen --print-secret
                stripeEvent = EventUtility.ConstructEvent(payload, signatureHeader, webhookSecret);
            }
            else
            {
                // ── Development path: no signature verification ───────────────────
                // WebhookSecret is not configured in appsettings.json.
                // Parse the raw JSON without HMAC verification so local testing works.
                // ⚠️  NEVER leave the secret empty in production — set
                //     Stripe:WebhookSecret in appsettings.production.json or as an
                //     environment variable before going live.
                stripeEvent = EventUtility.ParseEvent(payload, throwOnApiVersionMismatch: false);
            }
        }
        catch
        {
            return ProcessResult(Result<bool>.Failure(DomainErrors.Payments.InvalidWebhook, 400));
        }

        if (stripeEvent.Type != "payment_intent.succeeded")
            return ProcessResult(Result<bool>.Success(true, 200));

        var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
        if (paymentIntent is null)
            return ProcessResult(Result<bool>.Failure(DomainErrors.Payments.InvalidWebhook, 400));

        return ProcessResult(await handler.HandleAsync(new UpdateOrderPaymentStatusCommand
        {
            PaymentIntentId = paymentIntent.Id,
            IsPaid = true
        }, cancellationToken));
    }

    [Authorize]
    [HttpPost("cards")]
    [ProducesResponseType(typeof(Result<SavedCardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<SavedCardDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> AddCard(
        [FromBody] AddPaymentCardRequestDto request,
        [FromServices] IPaymentManagementService paymentManagementService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<SavedCardDto>.Failure(DomainErrors.Common.Unauthorized, 401));

        try
        {
            var card = await paymentManagementService.AddCardAsync(userId, request.PaymentMethodId, cancellationToken);
            return ProcessResult(Result<SavedCardDto>.Success(new SavedCardDto
            {
                PaymentMethodId = card.StripePaymentMethodId,
                Brand = card.Brand,
                Last4 = card.Last4,
                ExpMonth = card.ExpMonth,
                ExpYear = card.ExpYear,
                IsDefault = card.IsDefault
            }, 200));
        }
        catch (Exception ex)
        {
            return ProcessResult(Result<SavedCardDto>.Failure(DomainErrors.Common.Validation(ex.Message), 400));
        }
    }

   [Authorize]
    [HttpGet("cards")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<SavedCardDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCards(
        [FromServices] IPaymentManagementService paymentManagementService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<IReadOnlyList<SavedCardDto>>.Failure(DomainErrors.Common.Unauthorized, 401));

        var cards = await paymentManagementService.GetSavedCardsAsync(userId, cancellationToken);
        var response = cards.Select(x => new SavedCardDto
        {
            PaymentMethodId = x.StripePaymentMethodId,
            Brand = x.Brand,
            Last4 = x.Last4,
            ExpMonth = x.ExpMonth,
            ExpYear = x.ExpYear,
            IsDefault = x.IsDefault
        }).ToList();

        return ProcessResult(Result<IReadOnlyList<SavedCardDto>>.Success(response, 200));
    }

    [Authorize]
    [HttpDelete("cards/{id}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteCard(
        string id,
        [FromServices] IPaymentManagementService paymentManagementService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<bool>.Failure(DomainErrors.Common.Unauthorized, 401));

        var deleted = await paymentManagementService.DeleteCardAsync(userId, id, cancellationToken);
        if (!deleted)
            return ProcessResult(Result<bool>.Failure(DomainErrors.Common.NotFound, 404));

        return ProcessResult(Result<bool>.Success(true, 200));
    }

    [Authorize]
    [HttpGet("history")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<PaymentHistoryItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetHistory(
        [FromServices] IPaymentManagementService paymentManagementService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<IReadOnlyList<PaymentHistoryItemDto>>.Failure(DomainErrors.Common.Unauthorized, 401));

        var items = await paymentManagementService.GetPaymentHistoryAsync(userId, cancellationToken);
        var response = items.Select(x => new PaymentHistoryItemDto
        {
            Id = x.Id,
            Amount = x.Amount,
            Status = x.Status.ToString(),
            PaymentIntentId = x.StripePaymentIntentId ?? string.Empty,
            CreatedAt = x.CreatedOnUtc
        }).ToList();

        return ProcessResult(Result<IReadOnlyList<PaymentHistoryItemDto>>.Success(response, 200));
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<PaymentHistoryItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<PaymentHistoryItemDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetPaymentById(
        Guid id,
        [FromServices] IPaymentManagementService paymentManagementService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<PaymentHistoryItemDto>.Failure(DomainErrors.Common.Unauthorized, 401));

        var payment = await paymentManagementService.GetPaymentByIdAsync(userId, id, cancellationToken);
        if (payment is null)
            return ProcessResult(Result<PaymentHistoryItemDto>.Failure(DomainErrors.Common.NotFound, 404));

        return ProcessResult(Result<PaymentHistoryItemDto>.Success(new PaymentHistoryItemDto
        {
            Id = payment.Id,
            Amount = payment.Amount,
            Status = payment.Status.ToString(),
            PaymentIntentId = payment.StripePaymentIntentId ?? string.Empty,
            CreatedAt = payment.CreatedOnUtc
        }, 200));
    }

    [Authorize]
    [HttpPost("refund")]
    [ProducesResponseType(typeof(Result<RefundPaymentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<RefundPaymentResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Refund(
        [FromBody] RefundPaymentRequestDto request,
        [FromServices] IPaymentManagementService paymentManagementService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<RefundPaymentResponseDto>.Failure(DomainErrors.Common.Unauthorized, 401));

        try
        {
            var refund = await paymentManagementService.RefundPaymentAsync(
                userId,
                request.PaymentIntentId,
                request.Amount,
                cancellationToken);

            return ProcessResult(Result<RefundPaymentResponseDto>.Success(new RefundPaymentResponseDto
            {
                RefundId = refund.RefundId,
                Status = refund.Status,
                Amount = refund.Amount,
                Currency = refund.Currency
            }, 200));
        }
        catch (Exception ex)
        {
            return ProcessResult(Result<RefundPaymentResponseDto>.Failure(DomainErrors.Common.Validation(ex.Message), 400));
        }
    }
}
