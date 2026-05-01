using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

/// <summary>
/// Bulk data seeder — generates 5+ realistic records per main entity.
/// Runs after ApplicationDataSeeder (Order = 300).
/// Safe to run repeatedly; every section is guarded by a count threshold.
/// </summary>
internal sealed class BulkDataSeeder(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager) : IDataSeeder
{
    public int Order => 300;

    // ─── Name pools ───────────────────────────────────────────────────────────

    private static readonly string[] FirstNames =
    [
        "Ahmed", "Mohamed", "Omar", "Ali", "Hassan", "Ibrahim", "Khaled", "Youssef",
        "Mahmoud", "Tarek", "Sara", "Nora", "Layla", "Hana", "Dina", "Rania",
        "Fatima", "Aisha", "Mona", "Yasmine", "Karim", "Samer", "Ramy", "Adel",
        "Walid", "Bassem", "Tamer", "Sherif", "Amr", "Wael"
    ];

    private static readonly string[] LastNames =
    [
        "Hassan", "Ibrahim", "Khalil", "Mansour", "Nasser", "Othman", "Fahmy",
        "Gaber", "Salem", "Saad", "Zaki", "Younis", "Rashid", "Hamdi", "Aziz",
        "Barakat", "Darwish", "Elwy", "Fikry", "Gouda", "Hilal", "Ismail",
        "Jabr", "Kamal", "Lotfy", "Medhat", "Naguib", "Qasem", "Ragab", "Sabry"
    ];

    // ─── Vehicle pools ────────────────────────────────────────────────────────

    private static readonly string[] CarMakes =
        ["Toyota", "Honda", "Hyundai", "Kia", "Chevrolet", "Mitsubishi", "Nissan", "Mazda", "Ford", "Suzuki"];

    private static readonly string[] CarModels =
        ["Corolla", "Civic", "Elantra", "Cerato", "Aveo", "Lancer", "Sunny", "3", "Fiesta", "Swift"];

    private static readonly string[] Colors =
        ["White", "Black", "Silver", "Gray", "Blue", "Red", "Beige", "Green", "Pearl", "Champagne"];

    // ─── Location pools ───────────────────────────────────────────────────────

    private static readonly string[] CairoLocations =
    [
        "Nasr City — Abbas El Akkad St", "Maadi — Corniche El Nil",
        "Heliopolis — Merghany St", "Dokki — Tahrir Square",
        "6th of October — Central Axis", "New Cairo — 90th St",
        "Zamalek — 26th July Bridge", "Mohandessin — Gameat El Dowal St",
        "Shubra — El Khalifa St", "Ain Shams — El Nozha St",
        "Cairo Ring Road — Exit 7", "Cairo Ring Road — Exit 12",
        "October 6 Bridge — Eastbound", "Salah Salem — Near Stadium",
        "Autostrad Road — El Obour", "Suez Road — Km 25",
        "Alexandria Desert Road — Km 15", "Ismailia Desert Road — Km 30",
        "Cairo-Alexandria Agricultural Road", "Fayoum Road — Km 10"
    ];

    // ─── Report pools ─────────────────────────────────────────────────────────

    private static readonly string[] ReportTitles =
    [
        "Traffic light out of order", "Pothole hazard on road",
        "Fallen tree blocking lane", "Flooded underpass",
        "Wrong-way driver spotted", "Serious accident on highway",
        "Road works without warning signs", "Illegal parking blocking traffic",
        "Abandoned vehicle on shoulder", "Debris on road after storm",
        "Speed bump severely damaged", "Guardrail missing on bridge",
        "Manhole cover missing", "Lane markings faded",
        "Street sign obscured by tree", "Dangerous intersection"
    ];

    private static readonly string[] ReportDescriptions =
    [
        "Signal stuck on red causing long queues in both directions.",
        "Large pothole formed after rain — vehicles swerving to avoid.",
        "Fallen palm tree blocking the right lane completely.",
        "Underpass flooded; no-entry signs missing.",
        "Vehicle travelling against traffic at high speed.",
        "Multi-vehicle collision with debris across two lanes.",
        "Construction zone with no visible warning signs.",
        "Double-parked trucks narrowing road to single lane.",
        "Vehicle abandoned on hard shoulder causing bottleneck.",
        "Storm debris scattered across the road surface.",
        "Speed bump severely damaged — risk to low-clearance vehicles.",
        "Guardrail completely missing on bridge approach.",
        "Uncovered manhole in middle of lane — hazardous at night.",
        "Lane markings worn — drivers changing lanes unsafely.",
        "Street sign obscured by overgrown tree.",
        "Blind intersection — cross traffic not visible."
    ];

    // ─── Incident pools ───────────────────────────────────────────────────────

    private static readonly string[] IncidentTitles =
    [
        "Minor collision near Ring Road", "Heavy congestion due to roadworks",
        "Broken traffic light at main junction", "Car breakdown blocking lane",
        "Fuel spill slowing traffic", "Water logging after rainfall",
        "Truck overturned on highway", "Road closure for maintenance",
        "Animal crossing causing slowdown", "Protest blocking main street",
        "Street light outage in tunnel", "Bridge repair causing lane closure",
        "Emergency vehicle convoy", "Oversized load transport",
        "School bus accident near junction", "Sand storm reducing visibility"
    ];

    // ─── Notification pools ───────────────────────────────────────────────────

    private static readonly string[] NotificationTitles =
    [
        "New SOS request nearby", "Job accepted by provider",
        "Payment received", "Order shipped",
        "Order delivered", "New support ticket assigned",
        "Ticket resolved", "Provider rating received",
        "New product review", "Account verified",
        "Weekly earnings summary", "Service area expanded",
        "Scheduled maintenance reminder", "Low stock alert",
        "New order received", "Refund processed"
    ];

    private static readonly string[] NotificationBodies =
    [
        "A new emergency request has been submitted near your location.",
        "Your job request has been accepted by a nearby provider.",
        "Payment of EGP {amount} has been received successfully.",
        "Your order has been shipped and is on its way.",
        "Your order has been delivered. Please rate your experience.",
        "A new support ticket has been assigned to your queue.",
        "Ticket #1048 has been resolved by the support team.",
        "You received a 5-star rating for your last job.",
        "A customer left a review on your product.",
        "Your account has been verified and activated.",
        "Your earnings this week total EGP {amount}.",
        "Your service area has been expanded to include New Cairo.",
        "Your vehicle is due for scheduled maintenance.",
        "Product stock is running low — restock recommended.",
        "You have received a new order. Please confirm within 30 minutes.",
        "Your refund of EGP {amount} has been processed successfully."
    ];

    // ─── Rating comment pool ──────────────────────────────────────────────────

    private static readonly string[] RatingComments =
    [
        "Excellent response time, highly recommended!",
        "Good service overall, minor delay on arrival.",
        "Provider was professional and efficient.",
        "Problem was not fully resolved — needs follow-up.",
        "Outstanding — arrived within 5 minutes!",
        "Average experience, communication could be better.",
        "Very satisfied, will use again.",
        "Disappointed — provider cancelled without notice.",
        "Quick and professional service.",
        "Great value for the price."
    ];

    // ─── Enum pools ───────────────────────────────────────────────────────────

    private static readonly VehicleType[] VehicleTypes =
        [VehicleType.Car, VehicleType.Truck, VehicleType.Motorcycle, VehicleType.Bus];

    private static readonly IncidentSeverity[] Severities =
        [IncidentSeverity.Low, IncidentSeverity.Medium, IncidentSeverity.High, IncidentSeverity.Critical];

    private static readonly OrderStatus[] OrderStatuses =
        [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled];

    // ─── Product templates ────────────────────────────────────────────────────

    private static readonly (string Name, string Desc, decimal Price, int MaxStock)[] ProductTemplates =
    [
        ("Castrol GTX 5W-40",          "Full synthetic motor oil for modern engines.",                  45.99m, 300),
        ("Shell Helix Ultra 5W-30",    "Premium synthetic oil with active cleansing technology.",       52.50m, 250),
        ("Motul 8100 Eco-Nergy 0W-30", "Fuel-economy-focused fully synthetic oil.",                    61.00m, 180),
        ("Michelin CrossClimate 2",    "All-season tyre with superior wet and snow performance.",      148.00m,  80),
        ("Bridgestone Turanza T005",   "Premium touring tyre for comfort and fuel efficiency.",        122.75m, 100),
        ("Continental UltraContact",   "High-performance tyre for dry and wet roads.",                135.50m,  70),
        ("Bosch S5 70Ah Battery",      "Maintenance-free AGM battery with high CCA.",                 115.00m,  50),
        ("Varta Blue Dynamic 60Ah",    "Reliable starter battery for standard vehicles.",               88.00m,  90),
        ("Brembo Front Brake Pads",    "OEM-quality ceramic brake pads for enhanced stopping.",         59.99m, 200),
        ("TRW Rear Brake Discs",       "Ventilated disc rotors with corrosion-resistant coating.",      74.50m, 150),
        ("Mann-Filter Oil Filter",     "High-flow oil filter for extended service intervals.",            9.99m, 500),
        ("Bosch Air Filter",           "Multi-layer air filter for engines up to 2.5L.",                14.50m, 400),
        ("Philips X-tremeUltinon H7",  "LED headlight — 250% brighter than standard halogen.",         89.00m, 120),
        ("Osram Night Breaker H4",     "Halogen bulb with 150% more light output.",                    22.00m, 350),
        ("Meguiar's Complete Care Kit","Car wash, wax, and interior cleaner bundle.",                   38.00m, 220),
        ("Bosch AEROTWIN Wiper Set",   "Frameless flat blade wiper for streak-free visibility.",        28.50m, 280),
        ("Prestone Antifreeze",        "Concentrated coolant for aluminium and alloy engines.",         18.00m, 300),
        ("Monroe Shock Absorbers",     "OEM replacement shocks for improved ride quality.",             95.00m,  60),
        ("Sachs Clutch Kit",           "Complete clutch replacement kit including pressure plate.",    185.00m,  40),
        ("Hella Reversing Camera",     "170-degree wide-angle parking camera with night vision.",       55.00m, 110)
    ];

    // ═════════════════════════════════════════════════════════════════════════
    // Main entry point
    // ═════════════════════════════════════════════════════════════════════════

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var rng = new Random(42); // fixed seed → reproducible data

        // ── Section 1 — Bulk Users ────────────────────────────────────────────
        await SeedUsersAsync(rng, cancellationToken);

        // Resolve all role-based user ID lists after users are created
        var allClientIds = await GetUserIdsByRoleAsync(AppRoles.Client,   cancellationToken);
        var allSellerIds = await GetUserIdsByRoleAsync(AppRoles.Seller,   cancellationToken);
        var allUserIds   = await GetAllUserIdsAsync(cancellationToken);

        // ── Section 2 — Bulk Categories ───────────────────────────────────────
        var categoryIds = await SeedCategoriesAsync(cancellationToken);

        // ── Section 3 — Bulk Vehicles ─────────────────────────────────────────
        var vehicleIds = await SeedVehiclesAsync(rng, allClientIds, cancellationToken);

        // ── Section 4 — Bulk Products ─────────────────────────────────────────
        var productIds = await SeedProductsAsync(rng, allSellerIds, categoryIds, cancellationToken);

        // ── Section 5 — Bulk Orders + OrderItems ──────────────────────────────
        await SeedOrdersAsync(rng, allClientIds, productIds, cancellationToken);

        // ── Section 6 — Bulk Ratings ──────────────────────────────────────────
        await SeedRatingsAsync(rng, allClientIds, cancellationToken);

        // ── Section 7 — Bulk Traffic Reports ──────────────────────────────────
        await SeedTrafficReportsAsync(rng, allClientIds, vehicleIds, cancellationToken);

        // ── Section 8 — Bulk Traffic Incidents ────────────────────────────────
        await SeedTrafficIncidentsAsync(rng, cancellationToken);

        // ── Section 9 — Bulk Sensor Data ──────────────────────────────────────
        await SeedSensorDataAsync(rng, vehicleIds, cancellationToken);

        // ── Section 10 — Bulk Notifications ──────────────────────────────────
        await SeedNotificationsAsync(rng, allUserIds, cancellationToken);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 1 — Bulk Users
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedUsersAsync(Random rng, CancellationToken ct)
    {
        // ── 5 Drivers ────────────────────────────────────────────────────────
        var existingClientCount = (await userManager.GetUsersInRoleAsync(AppRoles.Client))
            .Count(u => u.Email != null && u.Email.EndsWith("@smarttraffic.dev"));

        if (existingClientCount < 5)
        {
            for (var i = 1; i <= 5; i++)
            {
                ct.ThrowIfCancellationRequested();
                var email = $"driver{i:D3}@smarttraffic.dev";
                if (await userManager.FindByEmailAsync(email) is not null) continue;

                var user = new ApplicationUser
                {
                    UserName       = email,
                    Email          = email,
                    EmailConfirmed = true,
                    FirstName      = FirstNames[rng.Next(FirstNames.Length)],
                    LastName       = LastNames[rng.Next(LastNames.Length)],
                    PhoneNumber    = $"010{rng.Next(10_000_000, 99_999_999)}",
                    Points         = rng.Next(0, 2500),
                    IsPremium      = rng.NextDouble() < 0.2,
                    IsActive       = true,
                    Address        = CairoLocations[rng.Next(CairoLocations.Length)]
                };

                var result = await userManager.CreateAsync(user, "Driver@12345");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(user, AppRoles.Client);
            }
        }

        // ── 5 Additional Providers (provider02..provider06) ───────────────────
        var existingProviderCount = (await userManager.GetUsersInRoleAsync(AppRoles.Provider))
            .Count(u => u.Email != null && u.Email.EndsWith("@smarttraffic.dev"));

        if (existingProviderCount < 5)
        {
            for (var i = 2; i <= 6; i++)
            {
                ct.ThrowIfCancellationRequested();
                var email = $"provider{i:D2}@smarttraffic.dev";
                if (await userManager.FindByEmailAsync(email) is not null) continue;

                var user = new ApplicationUser
                {
                    UserName          = email,
                    Email             = email,
                    EmailConfirmed    = true,
                    FirstName         = FirstNames[rng.Next(FirstNames.Length)],
                    LastName          = LastNames[rng.Next(LastNames.Length)],
                    PhoneNumber       = $"011{rng.Next(10_000_000, 99_999_999)}",
                    IsActive          = true,
                    ProviderStatus    = ProviderStatus.Approved,
                    ProviderDocuments = $"https://docs.example.com/{Guid.NewGuid():N}.pdf",
                    Address           = CairoLocations[rng.Next(CairoLocations.Length)]
                };

                var result = await userManager.CreateAsync(user, "Provider@12345");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(user, AppRoles.Provider);
            }
        }

        // ── 5 Additional Sellers (seller02..seller06) ─────────────────────────
        var existingSellerCount = (await userManager.GetUsersInRoleAsync(AppRoles.Seller))
            .Count(u => u.Email != null && u.Email.EndsWith("@smarttraffic.dev"));

        if (existingSellerCount < 5)
        {
            for (var i = 2; i <= 6; i++)
            {
                ct.ThrowIfCancellationRequested();
                var email = $"seller{i:D2}@smarttraffic.dev";
                if (await userManager.FindByEmailAsync(email) is not null) continue;

                var user = new ApplicationUser
                {
                    UserName       = email,
                    Email          = email,
                    EmailConfirmed = true,
                    FirstName      = FirstNames[rng.Next(FirstNames.Length)],
                    LastName       = LastNames[rng.Next(LastNames.Length)],
                    PhoneNumber    = $"012{rng.Next(10_000_000, 99_999_999)}",
                    IsActive       = true,
                    Address        = CairoLocations[rng.Next(CairoLocations.Length)]
                };

                var result = await userManager.CreateAsync(user, "Seller@12345");
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(user, AppRoles.Seller);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 2 — Bulk Categories (10 additional)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task<List<Guid>> SeedCategoriesAsync(CancellationToken ct)
    {
        if (await dbContext.Categories.CountAsync(ct) < 15)
        {
            var extra = new[]
            {
                ("Lighting",          "Headlights, taillights, fog lamps, and LED upgrades."),
                ("Accessories",       "Car care, seat covers, dash cams, and interior accessories."),
                ("Wipers & Fluids",   "Wiper blades, washer fluids, and coolants."),
                ("Suspension",        "Shock absorbers, springs, control arms, and bushings."),
                ("Transmission",      "Gearbox parts, clutch kits, and transmission fluids."),
                ("Exhaust",           "Exhaust pipes, mufflers, and catalytic converters."),
                ("Cooling System",    "Radiators, water pumps, thermostats, and hoses."),
                ("Car Electronics",   "Stereos, GPS units, amplifiers, and parking sensors."),
                ("Tyres & Wheels",    "Alloy wheels, tyre repair kits, and valve stems."),
                ("Safety & Security", "Dashcams, car alarms, steering wheel locks.")
            };

            foreach (var (name, desc) in extra)
            {
                if (!await dbContext.Categories.AnyAsync(c => c.Name == name, ct))
                    await dbContext.Categories.AddAsync(new Category { Name = name, Description = desc }, ct);
            }

            await dbContext.SaveChangesAsync(ct);
        }

        return await dbContext.Categories.AsNoTracking().Select(c => c.Id).ToListAsync(ct);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 3 — Bulk Vehicles (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task<List<Guid>> SeedVehiclesAsync(
        Random rng, List<string> clientIds, CancellationToken ct)
    {
        if (await dbContext.Vehicles.CountAsync(ct) >= 5)
            return await dbContext.Vehicles.AsNoTracking().Select(v => v.Id).ToListAsync(ct);

        if (clientIds.Count == 0)
            return await dbContext.Vehicles.AsNoTracking().Select(v => v.Id).ToListAsync(ct);

        // Pre-load existing plate numbers to prevent duplicates.
        var existingPlates = new HashSet<string>(
            await dbContext.Vehicles.AsNoTracking().Select(v => v.PlateNumber).ToListAsync(ct));

        var vehicles = new List<Vehicle>();
        var baseYear = DateTime.UtcNow.Year;

        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            var plate = GenerateUniquePlate(rng, existingPlates);
            var makeIdx = rng.Next(CarMakes.Length);

            vehicles.Add(new Vehicle
            {
                OwnerId              = clientIds[i % clientIds.Count],
                PlateNumber          = plate,
                Make                 = CarMakes[makeIdx],
                Brand                = CarMakes[makeIdx],
                Model                = CarModels[makeIdx],
                Year                 = baseYear - rng.Next(0, 15),
                Color                = Colors[rng.Next(Colors.Length)],
                Type                 = VehicleTypes[rng.Next(VehicleTypes.Length)],
                IsDefault            = i % 3 == 0,
                IsDeleted            = false,
                RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
            });
        }

        await dbContext.Vehicles.AddRangeAsync(vehicles, ct);
        await dbContext.SaveChangesAsync(ct);

        return await dbContext.Vehicles.AsNoTracking().Select(v => v.Id).ToListAsync(ct);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 4 — Bulk Products (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task<List<Guid>> SeedProductsAsync(
        Random rng, List<string> sellerIds, List<Guid> categoryIds, CancellationToken ct)
    {
        if (await dbContext.Products.CountAsync(ct) >= 5)
            return await dbContext.Products.AsNoTracking().Select(p => p.Id).ToListAsync(ct);

        if (sellerIds.Count == 0 || categoryIds.Count == 0)
            return await dbContext.Products.AsNoTracking().Select(p => p.Id).ToListAsync(ct);

        var added = 0;
        for (var i = 0; added < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            var template = ProductTemplates[i % ProductTemplates.Length];
            var suffix   = i / ProductTemplates.Length;
            var name     = suffix == 0 ? template.Name : $"{template.Name} v{suffix + 1}";

            // Dedup: skip if this name already exists.
            if (await dbContext.Products.AnyAsync(p => p.Name == name, ct))
                continue;

            var price = Math.Round(template.Price * (1m + (decimal)(rng.NextDouble() * 0.2 - 0.1)), 2);

            await dbContext.Products.AddAsync(new Product
            {
                SellerId      = sellerIds[added % sellerIds.Count],
                CategoryId    = categoryIds[added % categoryIds.Count],
                Name          = name,
                Description   = template.Desc,
                Price         = price,
                StockQuantity = rng.Next(10, template.MaxStock)
            }, ct);

            added++;
        }

        await dbContext.SaveChangesAsync(ct);
        return await dbContext.Products.AsNoTracking().Select(p => p.Id).ToListAsync(ct);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 5 — Bulk Orders + OrderItems (5 orders)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedOrdersAsync(
        Random rng, List<string> clientIds, List<Guid> productIds, CancellationToken ct)
    {
        if (await dbContext.Orders.CountAsync(ct) >= 5) return;
        if (clientIds.Count == 0 || productIds.Count == 0) return;

        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            var status        = OrderStatuses[rng.Next(OrderStatuses.Length)];
            var paymentStatus = status == OrderStatus.Cancelled ? PaymentStatus.Failed : PaymentStatus.Paid;

            var order = new Order
            {
                UserId          = clientIds[i % clientIds.Count],
                Status          = status,
                PaymentStatus   = paymentStatus,
                TotalAmount     = 0m,
                PaymentIntentId = paymentStatus == PaymentStatus.Paid ? $"pi_bulk_{Guid.NewGuid():N}" : null
            };

            await dbContext.Orders.AddAsync(order, ct);
            await dbContext.SaveChangesAsync(ct);

            // 1–3 items per order, no duplicate product per order.
            var itemCount    = rng.Next(1, 4);
            var usedProdIds  = new HashSet<Guid>();
            var orderTotal   = 0m;

            for (var j = 0; j < itemCount; j++)
            {
                Guid prodId;
                var attempts = 0;
                do
                {
                    prodId = productIds[rng.Next(productIds.Count)];
                }
                while (!usedProdIds.Add(prodId) && ++attempts < 20);

                var product = await dbContext.Products.AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == prodId, ct);
                if (product is null) continue;

                var qty = rng.Next(1, 4);
                orderTotal += qty * product.Price;

                await dbContext.OrderItems.AddAsync(new OrderItem
                {
                    OrderId   = order.Id,
                    ProductId = prodId,
                    Quantity  = qty,
                    UnitPrice = product.Price
                }, ct);
            }

            order.TotalAmount = Math.Round(orderTotal, 2);
            dbContext.Orders.Update(order);
            await dbContext.SaveChangesAsync(ct);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 6 — Bulk Ratings (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedRatingsAsync(
        Random rng, List<string> clientIds, CancellationToken ct)
    {
        if (await dbContext.Ratings.CountAsync(ct) >= 5) return;
        if (clientIds.Count == 0) return;

        // Collect completed service request IDs and delivered order IDs.
        var completedSrIds = await dbContext.ServiceRequests
            .AsNoTracking()
            .Where(s => s.Status == RequestStatus.Completed)
            .Select(s => s.Id)
            .ToListAsync(ct);

        var deliveredOrderIds = await dbContext.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Delivered)
            .Select(o => o.Id)
            .ToListAsync(ct);

        if (completedSrIds.Count == 0 && deliveredOrderIds.Count == 0) return;

        var ratings = new List<Rating>();
        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            var userId = clientIds[i % clientIds.Count];

            Guid? srId    = null;
            Guid? orderId = null;

            // Alternate between service request and order ratings.
            if (i % 2 == 0 && completedSrIds.Count > 0)
            {
                srId = completedSrIds[i % completedSrIds.Count];

                // Dedup: skip if this user already rated this service request.
                if (await dbContext.Ratings.AnyAsync(
                        r => r.UserId == userId && r.ServiceRequestId == srId, ct))
                    continue;
            }
            else if (deliveredOrderIds.Count > 0)
            {
                orderId = deliveredOrderIds[i % deliveredOrderIds.Count];
            }
            else if (completedSrIds.Count > 0)
            {
                srId = completedSrIds[i % completedSrIds.Count];
            }
            else
            {
                continue;
            }

            ratings.Add(new Rating
            {
                UserId           = userId,
                ServiceRequestId = srId,
                OrderId          = orderId,
                Stars            = rng.Next(1, 6),
                Comment          = RatingComments[i % RatingComments.Length],
                CreatedAtUtc     = DateTime.UtcNow.AddDays(-rng.Next(1, 90))
            });
        }

        if (ratings.Count > 0)
        {
            await dbContext.Ratings.AddRangeAsync(ratings, ct);
            await dbContext.SaveChangesAsync(ct);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 7 — Bulk Traffic Reports (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedTrafficReportsAsync(
        Random rng, List<string> clientIds, List<Guid> vehicleIds, CancellationToken ct)
    {
        if (await dbContext.TrafficReports.CountAsync(ct) >= 5) return;
        if (clientIds.Count == 0) return;

        var reports = new List<TrafficReport>();

        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            Guid? vehicleId = vehicleIds.Count > 0 && rng.NextDouble() > 0.3
                ? vehicleIds[i % vehicleIds.Count]
                : null;

            reports.Add(new TrafficReport
            {
                ReporterId  = clientIds[i % clientIds.Count],
                VehicleId   = vehicleId,
                Title       = ReportTitles[i % ReportTitles.Length],
                Description = ReportDescriptions[i % ReportDescriptions.Length],
                Location    = CairoLocations[rng.Next(CairoLocations.Length)],
                IsResolved  = rng.NextDouble() < 0.35,
                IsVerified  = rng.NextDouble() < 0.6
            });
        }

        await dbContext.TrafficReports.AddRangeAsync(reports, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 8 — Bulk Traffic Incidents (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedTrafficIncidentsAsync(Random rng, CancellationToken ct)
    {
        if (await dbContext.TrafficIncidents.CountAsync(ct) >= 5) return;

        // Pre-load existing title+location combos for dedup.
        var existing = new HashSet<string>(
            await dbContext.TrafficIncidents
                .AsNoTracking()
                .Select(inc => inc.Title + "|" + inc.Location)
                .ToListAsync(ct));

        var incidents = new List<TrafficIncident>();

        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            var title    = $"{IncidentTitles[i % IncidentTitles.Length]} #{i + 1}";
            var location = CairoLocations[rng.Next(CairoLocations.Length)];
            var key      = title + "|" + location;

            if (!existing.Add(key)) continue;

            incidents.Add(new TrafficIncident
            {
                Title      = title,
                Location   = location,
                Severity   = Severities[rng.Next(Severities.Length)],
                IsResolved = rng.NextDouble() < 0.4
            });
        }

        if (incidents.Count > 0)
        {
            await dbContext.TrafficIncidents.AddRangeAsync(incidents, ct);
            await dbContext.SaveChangesAsync(ct);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 9 — Bulk Sensor Data (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedSensorDataAsync(
        Random rng, List<Guid> vehicleIds, CancellationToken ct)
    {
        if (await dbContext.SensorData.CountAsync(ct) >= 5) return;
        if (vehicleIds.Count == 0) return;

        var records = new List<SensorData>();

        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            records.Add(new SensorData
            {
                VehicleId          = vehicleIds[i % vehicleIds.Count],
                TemperatureCelsius = Math.Round((decimal)(18 + rng.NextDouble() * 27), 1),  // 18–45 °C
                HumidityPercentage = Math.Round((decimal)(20 + rng.NextDouble() * 65), 1),  // 20–85 %
                AirQualityIndex    = Math.Round((decimal)(30 + rng.NextDouble() * 170), 1), // 30–200
                CapturedAtUtc      = DateTime.UtcNow
                                         .AddDays(-rng.Next(0, 60))
                                         .AddHours(-rng.Next(0, 24))
                                         .AddMinutes(-rng.Next(0, 60))
            });
        }

        await dbContext.SensorData.AddRangeAsync(records, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section 10 — Bulk Notifications (5)
    // ═════════════════════════════════════════════════════════════════════════

    private async Task SeedNotificationsAsync(
        Random rng, List<string> allUserIds, CancellationToken ct)
    {
        if (await dbContext.Notifications.CountAsync(ct) >= 5) return;
        if (allUserIds.Count == 0) return;

        var notifications = new List<Notification>();

        for (var i = 0; i < 5; i++)
        {
            ct.ThrowIfCancellationRequested();

            var body = NotificationBodies[i % NotificationBodies.Length]
                .Replace("{amount}", rng.Next(100, 5000).ToString());

            notifications.Add(new Notification
            {
                UserId    = allUserIds[i % allUserIds.Count],
                Title     = NotificationTitles[i % NotificationTitles.Length],
                Message   = body,
                IsRead    = rng.NextDouble() < 0.5,
                CreatedAt = DateTime.UtcNow
                                .AddDays(-rng.Next(0, 30))
                                .AddHours(-rng.Next(0, 24))
            });
        }

        await dbContext.Notifications.AddRangeAsync(notifications, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Helpers
    // ═════════════════════════════════════════════════════════════════════════

    private static string GenerateUniquePlate(Random rng, HashSet<string> used)
    {
        var regions = new[] { "CA", "GZ", "AL", "QA", "MN", "SH", "SM", "IS", "PT", "SZ" };
        string plate;
        do
        {
            plate = $"{regions[rng.Next(regions.Length)]}-{rng.Next(1000, 9999)}";
        }
        while (!used.Add(plate));
        return plate;
    }

    private async Task<List<string>> GetUserIdsByRoleAsync(string role, CancellationToken ct)
    {
        var users = await userManager.GetUsersInRoleAsync(role);
        return users.Select(u => u.Id).ToList();
    }

    private async Task<List<string>> GetAllUserIdsAsync(CancellationToken ct)
    {
        return await dbContext.Users.AsNoTracking().Select(u => u.Id).ToListAsync(ct);
    }
}
