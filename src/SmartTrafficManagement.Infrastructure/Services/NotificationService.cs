namespace SmartTrafficManagement.Infrastructure.Services;

public sealed class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _dbContext;

    public NotificationService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Notification?> MarkAsReadAsync(Guid notificationId, string userId, CancellationToken cancellationToken = default)
    {
        var notification = await _dbContext.Notifications
            .FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId, cancellationToken);
        if (notification is null)
        {
            return null;
        }

        notification.IsRead = true;
        notification.UpdatedOnUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return notification;
    }

    public async Task<bool> DeleteAsync(Guid notificationId, string userId, CancellationToken cancellationToken = default)
    {
        var notification = await _dbContext.Notifications
            .FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId, cancellationToken);
        if (notification is null)
        {
            return false;
        }

        _dbContext.Notifications.Remove(notification);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
