using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Notifications;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
//[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController : BaseController
{
    [HttpGet]
    [ProducesResponseType(typeof(Result<IReadOnlyList<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNotifications(
        [FromServices] INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return ProcessResult(Result<IReadOnlyList<NotificationDto>>.Failure(DomainErrors.Common.Unauthorized, 401));
        }

        var notifications = await notificationService.GetUserNotificationsAsync(userId, cancellationToken);
        var response = notifications.Select(x => new NotificationDto
        {
            Id = x.Id,
            Title = x.Title,
            Message = x.Message,
            IsRead = x.IsRead,
            CreatedAt = x.CreatedAt
        }).ToList();

        return ProcessResult(Result<IReadOnlyList<NotificationDto>>.Success(response, 200));
    }

    [HttpPut("{id:guid}/read")]
    [ProducesResponseType(typeof(Result<NotificationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<NotificationDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> MarkAsRead(
        Guid id,
        [FromServices] INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return ProcessResult(Result<NotificationDto>.Failure(DomainErrors.Common.Unauthorized, 401));
        }

        var notification = await notificationService.MarkAsReadAsync(id, userId, cancellationToken);
        if (notification is null)
        {
            return ProcessResult(Result<NotificationDto>.Failure(DomainErrors.Common.NotFound, 404));
        }

        var response = new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };

        return ProcessResult(Result<NotificationDto>.Success(response, 200));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(
        Guid id,
        [FromServices] INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return ProcessResult(Result<bool>.Failure(DomainErrors.Common.Unauthorized, 401));
        }

        var deleted = await notificationService.DeleteAsync(id, userId, cancellationToken);
        if (!deleted)
        {
            return ProcessResult(Result<bool>.Failure(DomainErrors.Common.NotFound, 404));
        }

        return ProcessResult(Result<bool>.Success(true, 200));
    }
}
