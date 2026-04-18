using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

internal sealed class IdentitySeeder(
    RoleManager<IdentityRole> roleManager,
    UserManager<ApplicationUser> userManager,
    IOptions<SeedOptions> seedOptions) : IDataSeeder
{
    public int Order => 100;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var options = seedOptions.Value;
        var rolesToEnsure = options.Roles.Count > 0
            ? options.Roles
            : [AppRoles.Admin, AppRoles.Seller, AppRoles.Provider, AppRoles.Client];

        foreach (var role in rolesToEnsure)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var roleResult = await roleManager.CreateAsync(new IdentityRole(role));
                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Failed to create role '{role}': {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }
            }
        }

        await EnsureUserInRoleAsync(
            options.Admin.Email,
            options.Admin.Password,
            AppRoles.Admin,
            options.Admin.FirstName,
            options.Admin.LastName);
        await EnsureUserInRoleAsync("seller@test.com",   "Seller@123",   AppRoles.Seller,   "Nora",  "Seller");
        await EnsureUserInRoleAsync("provider@test.com", "Provider@123", AppRoles.Provider, "Omar",  "Provider");
        await EnsureUserInRoleAsync("driver@test.com",   "Driver@123",   AppRoles.Client,   "Layla", "Driver");
    }

    private async Task EnsureUserInRoleAsync(
        string email,
        string password,
        string role,
        string firstName,
        string lastName)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName       = email,
                Email          = email,
                EmailConfirmed = true,
                FirstName      = firstName,
                LastName       = lastName,
                IsActive       = true
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to create user '{email}': {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
            }
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            var addToRoleResult = await userManager.AddToRoleAsync(user, role);
            if (!addToRoleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to assign role '{role}' to '{email}': {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
            }
        }
    }
}
