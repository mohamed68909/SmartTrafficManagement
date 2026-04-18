namespace SmartTrafficManagement.Core.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedOnUtc { get; set; }
}
