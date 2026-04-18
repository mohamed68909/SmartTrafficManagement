using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(string userId, CancellationToken cancellationToken = default);

    Task<Notification?> MarkAsReadAsync(Guid notificationId, string userId, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid notificationId, string userId, CancellationToken cancellationToken = default);
}
