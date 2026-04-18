namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

public interface IDatabaseSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
