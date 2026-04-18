namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

public sealed class SeedOptions
{
    public const string SectionName = "Seeding";

    public bool Enabled { get; init; } = true;

    public List<string> Roles { get; init; } = [];

    public SeedUserOptions Admin { get; init; } = new();
}

public sealed class SeedUserOptions
{
    public string Email { get; init; } = "admin@test.com";
    public string Password { get; init; } = "Admin@123";
    public string FirstName { get; init; } = "System";
    public string LastName { get; init; } = "Admin";
}
