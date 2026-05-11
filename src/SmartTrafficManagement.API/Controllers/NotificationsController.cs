using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Notifications;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;
using SmartTrafficManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
[Authorize]
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

    [AllowAnonymous]
    [HttpPost("seed")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult> SeedNotifications(
        [FromServices] ApplicationDbContext dbContext,
        [FromServices] UserManager<ApplicationUser> userManager,
        CancellationToken cancellationToken)
    {
        var users = await userManager.Users.ToListAsync(cancellationToken);
        int added = 0;

        foreach (var user in users)
        {
            var notifs = new List<Notification>
            {
                new Notification { UserId = user.Id, Title = "Welcome to AutoCare", Message = "Thank you for registering! Explore our services like store, garage, and emergency.", IsRead = false, CreatedAt = DateTime.UtcNow },
                new Notification { UserId = user.Id, Title = "Winter Checkup", Message = "Schedule your winter inspection now to ensure your vehicle is safe for cold weather.", IsRead = false, CreatedAt = DateTime.UtcNow.AddDays(-1) },
                new Notification { UserId = user.Id, Title = "Emergency SOS Ready", Message = "Your SOS emergency service is ready. Tap the red button anytime you need immediate assistance.", IsRead = true, CreatedAt = DateTime.UtcNow.AddDays(-2) }
            };
            await dbContext.Notifications.AddRangeAsync(notifs, cancellationToken);
            added += 3;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return ProcessResult(Result<bool>.Success(true, 200));
    }
}
