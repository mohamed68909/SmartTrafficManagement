namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

public sealed class DatabaseSeeder(
    ApplicationDbContext dbContext,
    IEnumerable<IDataSeeder> seeders,
    IOptions<SeedOptions> seedOptions,
    ILogger<DatabaseSeeder> logger) : IDatabaseSeeder
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var options = seedOptions.Value;
        if (!options.Enabled)
        {
            logger.LogInformation("Database seeding is disabled.");
            return;
        }

        try
        {
            await dbContext.Database.MigrateAsync(cancellationToken);

            foreach (var seeder in seeders.OrderBy(s => s.Order))
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    await seeder.SeedAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Seeder {SeederName} failed.", seeder.GetType().Name);
                    // Do not throw here so other seeders can attempt to run, or just log.
                }
            }

            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database seeding/migration. The database might not be available yet.");
            // Do NOT throw here, allowing the app to start up and return API responses (even if they fail later due to no DB)
        }
    }
}
