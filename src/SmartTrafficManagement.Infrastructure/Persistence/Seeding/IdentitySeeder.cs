using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Enums;

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

        // ── Roles ──────────────────────────────────────────────────────────────
        // Always ensure every role the application depends on exists, then
        // also ensure any extra roles coming from configuration.
        var requiredRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            AppRoles.Admin,
            AppRoles.Client,
            AppRoles.Provider,
            AppRoles.Seller,
            AppRoles.CSAgent,
        };

        var options = seedOptions.Value;
        foreach (var configRole in options.Roles)
            requiredRoles.Add(configRole);

        foreach (var role in requiredRoles)
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

        // ── Admin ──────────────────────────────────────────────────────────────
        await EnsureUserInRoleAsync(
            options.Admin.Email,
            options.Admin.Password,
            AppRoles.Admin,
            options.Admin.FirstName,
            options.Admin.LastName);

        // ── Drivers ────────────────────────────────────────────────────────────
        await EnsureUserInRoleAsync("driver@test.com",   "Driver@123",  AppRoles.Client, "Layla",   "Driver",   isActive: true);
        await EnsureUserInRoleAsync("m.hassan@mail.eg",  "Driver@123",  AppRoles.Client, "Mohamed", "Hassan",   isActive: true);
        await EnsureUserInRoleAsync("lina@mail.eg",      "Driver@123",  AppRoles.Client, "Lina",    "Ahmed",    isActive: true);
        await EnsureUserInRoleAsync("youssef@mail.eg",   "Driver@123",  AppRoles.Client, "Youssef", "Salem",    isActive: false);
        await EnsureUserInRoleAsync("sara@mail.eg",      "Driver@123",  AppRoles.Client, "Sara",    "Ahmed",    isActive: true);
        await EnsureUserInRoleAsync("khaled@mail.eg",    "Driver@123",  AppRoles.Client, "Khaled",  "Ali",      isActive: false);
        await EnsureUserInRoleAsync("amira@mail.eg",     "Driver@123",  AppRoles.Client, "Amira",   "Khaled",   isActive: true);
        await EnsureUserInRoleAsync("tarek@mail.eg",     "Driver@123",  AppRoles.Client, "Tarek",   "Mahmoud",  isActive: true);
        await EnsureUserInRoleAsync("nour@mail.eg",      "Driver@123",  AppRoles.Client, "Nour",    "Mohamed",  isActive: true);
        await EnsureUserInRoleAsync("layla2@mail.eg",    "Driver@123",  AppRoles.Client, "Layla",   "Ibrahim",  isActive: true);
        await EnsureUserInRoleAsync("ahmed@mail.eg",     "Driver@123",  AppRoles.Client, "Ahmed",   "Mostafa",  isActive: true);
        await EnsureUserInRoleAsync("rami@mail.eg",      "Driver@123",  AppRoles.Client, "Rami",    "Fouad",    isActive: true);

        // ── Sellers ────────────────────────────────────────────────────────────
        await EnsureUserInRoleAsync("seller@test.com",   "Seller@123",  AppRoles.Seller, "Tire",   "World",  isActive: true);
        await EnsureUserInRoleAsync("safety@store.eg",   "Seller@123",  AppRoles.Seller, "Safety", "Store",  isActive: false,
            providerStatus: ProviderStatus.Pending);
        await EnsureUserInRoleAsync("parts@plus.eg",     "Seller@123",  AppRoles.Seller, "Parts",  "Plus",   isActive: true);

        // ── Providers ──────────────────────────────────────────────────────────
        await EnsureUserInRoleAsync("provider@test.com", "Provider@123", AppRoles.Provider, "Quick", "Rescue",   isActive: true,
            providerStatus: ProviderStatus.Approved,
            providerDocuments: "https://docs.example.com/qr-id.pdf|https://docs.example.com/qr-license.pdf|https://docs.example.com/qr-cert.pdf");

        await EnsureUserInRoleAsync("auto@fix.eg",       "Provider@123", AppRoles.Provider, "AutoFix", "Pro",     isActive: true,
            providerStatus: ProviderStatus.Approved,
            providerDocuments: "https://docs.example.com/af-id.pdf|https://docs.example.com/af-license.pdf|https://docs.example.com/af-cert.pdf");

        await EnsureUserInRoleAsync("mega@recovery.eg",  "Provider@123", AppRoles.Provider, "Mega", "Recovery",  isActive: false,
            providerStatus: ProviderStatus.Pending,
            providerDocuments: "https://docs.example.com/mr-id.pdf|https://docs.example.com/mr-license.pdf");

        await EnsureUserInRoleAsync("fuel@express.eg",   "Provider@123", AppRoles.Provider, "Fuel", "Express",   isActive: false,
            providerStatus: ProviderStatus.Pending,
            providerDocuments: "https://docs.example.com/fe-id.pdf|https://docs.example.com/fe-license.pdf");

        // ── CS Agents ──────────────────────────────────────────────────────────
        // Only one CS Agent as requested by user
        await EnsureUserInRoleAsync("cs@test.com", "CSAgent@123", AppRoles.CSAgent, "Sarah", "Kamal", isActive: true);

        // CS Agents list cleanup removed to support bulk CS agents seeding.
    }

    // ── Helper ─────────────────────────────────────────────────────────────────
    private async Task EnsureUserInRoleAsync(
        string email,
        string password,
        string role,
        string firstName,
        string lastName,
        bool isActive = true,
        ProviderStatus? providerStatus = null,
        string? providerDocuments = null)
    {
        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName          = email,
                Email             = email,
                EmailConfirmed    = true,
                FirstName         = firstName,
                LastName          = lastName,
                IsActive          = isActive,
                ProviderStatus    = providerStatus,
                ProviderDocuments = providerDocuments,
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
