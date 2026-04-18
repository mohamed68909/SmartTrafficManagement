using SmartTrafficManagement.Core.Constants;

namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

/// <summary>
/// Bulk data seeder — generates 200 realistic records per main entity.
/// Runs after ApplicationDataSeeder (Order = 300).
/// Safe to run repeatedly; skips each section if data already exists.
/// </summary>
internal sealed class BulkDataSeeder(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager) : IDataSeeder
{
    public int Order => 300;

    // ─── Realistic lookup pools ──────────────────────────────────────────────

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

    private static readonly string[] CarMakes =
    [
        "Toyota", "Honda", "Hyundai", "Kia", "Chevrolet",
        "Mitsubishi", "Nissan", "Mazda", "Ford", "Suzuki"
    ];

    private static readonly string[] CarModels =
    [
        "Corolla", "Civic", "Elantra", "Cerato", "Aveo",
        "Lancer", "Sunny", "3", "Fiesta", "Swift"
    ];

    private static readonly string[] Colors =
    [
        "White", "Black", "Silver", "Gray", "Blue",
        "Red", "Beige", "Green", "Pearl", "Champagne"
    ];

    private static readonly string[] CairoLocations =
    [
        "Nasr City - Abbas El Akkad St", "Maadi - Corniche El Nil",
        "Heliopolis - Merghany St", "Dokki - Tahrir Square",
        "6th of October - Central Axis", "New Cairo - 90th St",
        "Zamalek - 26th July Bridge", "Mohandessin - Gameat El Dowal St",
        "Shubra - El Khalifa St", "Ain Shams - El Nozha St",
        "Cairo Ring Road - Exit 7", "Cairo Ring Road - Exit 12",
        "October 6 Bridge - Eastbound", "Salah Salem - Near Stadium",
        "Autostrad Road - El Obour", "Suez Road - Km 25",
        "Alexandria Desert Road - Km 15", "Ismailia Desert Road - Km 30",
        "Cairo-Alexandria Agricultural Road", "Fayoum Road - Km 10"
    ];

    private static readonly string[] IncidentTitles =
    [
        "Minor collision near Ring Road", "Heavy congestion due to roadworks",
        "Broken traffic light at main junction", "Car breakdown blocking lane",
        "Fuel spill slowing traffic", "Water logging after rainfall",
        "Truck overturned on highway", "Road closure for maintenance",
        "Animal crossing causing slowdown", "Protest blocking main street",
        "Street light outage on tunnel", "Bridge repair causing lane closure",
        "Emergency vehicle convoy", "Oversized load transport",
        "School bus accident near junction", "Sand storm reducing visibility"
    ];

    private static readonly string[] ReportTitles =
    [
        "Traffic light out of order", "Pothole hazard on road",
        "Fallen tree blocking lane", "Flooded underpass",
        "Wrong-way driver spotted", "Serious accident on highway",
        "Road works without warning signs", "Illegal parking blocking traffic",
        "Abandoned vehicle on shoulder", "Debris on road after storm",
        "Speed bump damaged", "Guardrail missing on bridge",
        "Manhole cover missing", "Lane markings faded",
        "Street sign obscured by tree", "Dangerous intersection"
    ];

    // ─── Enums ───────────────────────────────────────────────────────────────

    private static readonly VehicleType[] VehicleTypes =
        [VehicleType.Car, VehicleType.Truck, VehicleType.Motorcycle, VehicleType.Bus];

    private static readonly IncidentSeverity[] Severities =
        [IncidentSeverity.Low, IncidentSeverity.Medium, IncidentSeverity.High, IncidentSeverity.Critical];

    private static readonly OrderStatus[] OrderStatuses =
        [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled];

    private static readonly PaymentStatus[] PaymentStatuses =
        [PaymentStatus.Pending, PaymentStatus.Paid, PaymentStatus.Failed, PaymentStatus.Refunded];

    // ─── Main seed method ────────────────────────────────────────────────────

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var rng = new Random(42); // Fixed seed → reproducible data

        // ── 1. Users (200 Client + 30 Provider + 20 Seller) ─────────────────
        var newUserIds = await SeedUsersAsync(rng, cancellationToken);

        // Collect ALL client-role user IDs (existing + new)
        var allClientIds = await GetUserIdsByRoleAsync(AppRoles.Client, cancellationToken);
        var allSellerIds = await GetUserIdsByRoleAsync(AppRoles.Seller, cancellationToken);

        // ── 2. Extra Categories ──────────────────────────────────────────────
        var categoryIds = await SeedCategoriesAsync(cancellationToken);

        // ── 3. Vehicles (200) ────────────────────────────────────────────────
        var vehicleIds = await SeedVehiclesAsync(rng, allClientIds, cancellationToken);

        // ── 4. Products (200) ────────────────────────────────────────────────
        var productIds = await SeedProductsAsync(rng, allSellerIds, categoryIds, cancellationToken);

        // ── 5. Orders + OrderItems (200 orders, 1–3 items each) ──────────────
        await SeedOrdersAsync(rng, allClientIds, productIds, cancellationToken);

        // ── 6. TrafficReports (200) ──────────────────────────────────────────
        await SeedTrafficReportsAsync(rng, allClientIds, vehicleIds, cancellationToken);

        // ── 7. TrafficIncidents (200) ────────────────────────────────────────
        await SeedTrafficIncidentsAsync(rng, cancellationToken);

        // ── 8. SensorData (200) ──────────────────────────────────────────────
        await SeedSensorDataAsync(rng, vehicleIds, cancellationToken);
    }

    // ─── 1. Users ────────────────────────────────────────────────────────────

    private async Task<List<string>> SeedUsersAsync(Random rng, CancellationToken ct)
    {
        var createdIds = new List<string>();

        // 200 clients
        for (var i = 1; i <= 200; i++)
        {
            ct.ThrowIfCancellationRequested();
            var email = $"client{i:D3}@smarttraffic.dev";
            if (await userManager.FindByEmailAsync(email) is not null) continue;

            var fn = FirstNames[rng.Next(FirstNames.Length)];
            var ln = LastNames[rng.Next(LastNames.Length)];
            var user = new ApplicationUser
            {
                UserName    = email,
                Email       = email,
                EmailConfirmed = true,
                FirstName   = fn,
                LastName    = ln,
                PhoneNumber = $"010{rng.Next(10_000_000, 99_999_999)}",
                Points      = rng.Next(0, 2500),
                IsPremium   = rng.NextDouble() < 0.2,
                IsActive    = true,
                Address     = CairoLocations[rng.Next(CairoLocations.Length)]
            };

            var result = await userManager.CreateAsync(user, "Client@12345");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, AppRoles.Client);
                createdIds.Add(user.Id);
            }
        }

        // 30 extra providers
        for (var i = 2; i <= 30; i++)
        {
            ct.ThrowIfCancellationRequested();
            var email = $"provider{i:D2}@smarttraffic.dev";
            if (await userManager.FindByEmailAsync(email) is not null) continue;

            var fn = FirstNames[rng.Next(FirstNames.Length)];
            var ln = LastNames[rng.Next(LastNames.Length)];
            var user = new ApplicationUser
            {
                UserName    = email,
                Email       = email,
                EmailConfirmed = true,
                FirstName   = fn,
                LastName    = ln,
                PhoneNumber = $"011{rng.Next(10_000_000, 99_999_999)}",
                IsActive    = true,
                Address     = CairoLocations[rng.Next(CairoLocations.Length)]
            };

            var result = await userManager.CreateAsync(user, "Provider@12345");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(user, AppRoles.Provider);
        }

        // 20 extra sellers
        for (var i = 2; i <= 20; i++)
        {
            ct.ThrowIfCancellationRequested();
            var email = $"seller{i:D2}@smarttraffic.dev";
            if (await userManager.FindByEmailAsync(email) is not null) continue;

            var fn = FirstNames[rng.Next(FirstNames.Length)];
            var ln = LastNames[rng.Next(LastNames.Length)];
            var user = new ApplicationUser
            {
                UserName    = email,
                Email       = email,
                EmailConfirmed = true,
                FirstName   = fn,
                LastName    = ln,
                PhoneNumber = $"012{rng.Next(10_000_000, 99_999_999)}",
                IsActive    = true,
                Address     = CairoLocations[rng.Next(CairoLocations.Length)]
            };

            var result = await userManager.CreateAsync(user, "Seller@12345");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(user, AppRoles.Seller);
        }

        return createdIds;
    }

    // ─── 2. Categories ────────────────────────────────────────────────────────

    private async Task<List<Guid>> SeedCategoriesAsync(CancellationToken ct)
    {
        var extraCategories = new[]
        {
            ("Brake Parts",       "Brake pads, discs, calipers, and brake fluids."),
            ("Filters",           "Air, oil, fuel, and cabin filters for all vehicles."),
            ("Lighting",          "Headlights, taillights, fog lamps, and LED upgrades."),
            ("Accessories",       "Car care, seat covers, dash cams, and interior accessories."),
            ("Wipers & Fluids",   "Wiper blades, washer fluids, and coolants."),
            ("Suspension",        "Shock absorbers, springs, control arms, and bushings."),
            ("Transmission",      "Gearbox parts, clutch kits, and transmission fluids."),
            ("Exhaust",           "Exhaust pipes, mufflers, catalytic converters."),
            ("Cooling System",    "Radiators, water pumps, thermostats, and hoses."),
            ("Car Electronics",   "Stereos, amplifiers, GPS units, and parking sensors.")
        };

        foreach (var (name, desc) in extraCategories)
        {
            if (!await dbContext.Categories.AnyAsync(c => c.Name == name, ct))
            {
                await dbContext.Categories.AddAsync(new Category { Name = name, Description = desc }, ct);
            }
        }

        await dbContext.SaveChangesAsync(ct);
        return await dbContext.Categories.AsNoTracking().Select(c => c.Id).ToListAsync(ct);
    }

    // ─── 3. Vehicles ─────────────────────────────────────────────────────────

    private async Task<List<Guid>> SeedVehiclesAsync(
        Random rng, List<string> clientIds, CancellationToken ct)
    {
        if (await dbContext.Vehicles.CountAsync(ct) >= 200)
            return await dbContext.Vehicles.AsNoTracking().Select(v => v.Id).ToListAsync(ct);

        if (clientIds.Count == 0) return [];

        var plateSet  = new HashSet<string>();
        var vehicles  = new List<Vehicle>();
        var baseYear  = DateTime.UtcNow.Year;

        for (var i = 0; i < 200; i++)
        {
            ct.ThrowIfCancellationRequested();

            var plate = GenerateUniquePlate(rng, plateSet);
            var makeIndex = rng.Next(CarMakes.Length);

            vehicles.Add(new Vehicle
            {
                OwnerId     = clientIds[i % clientIds.Count],
                PlateNumber = plate,
                Make        = CarMakes[makeIndex],
                Brand       = CarMakes[makeIndex],
                Model       = CarModels[makeIndex],
                Year        = baseYear - rng.Next(0, 15),
                Color       = Colors[rng.Next(Colors.Length)],
                Type        = VehicleTypes[rng.Next(VehicleTypes.Length)],
                IsDefault   = i % 3 == 0,        // every 3rd is default
                IsDeleted   = false,
                RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
            });
        }

        await dbContext.Vehicles.AddRangeAsync(vehicles, ct);
        await dbContext.SaveChangesAsync(ct);

        return await dbContext.Vehicles.AsNoTracking().Select(v => v.Id).ToListAsync(ct);
    }

    // ─── 4. Products ─────────────────────────────────────────────────────────

    private async Task<List<Guid>> SeedProductsAsync(
        Random rng, List<string> sellerIds, List<Guid> categoryIds, CancellationToken ct)
    {
        if (await dbContext.Products.CountAsync(ct) >= 200)
            return await dbContext.Products.AsNoTracking().Select(p => p.Id).ToListAsync(ct);

        if (sellerIds.Count == 0 || categoryIds.Count == 0) return [];

        var productTemplates = new[]
        {
            ("Castrol GTX 5W-40",         "Full synthetic motor oil for modern engines.",                 45.99m,  300),
            ("Shell Helix Ultra 5W-30",    "Premium synthetic oil with active cleansing technology.",     52.50m,  250),
            ("Motul 8100 Eco-Nergy 0W-30", "Fuel-economy-focused fully synthetic oil.",                  61.00m,  180),
            ("Michelin CrossClimate 2",    "All-season tire with superior wet and snow performance.",    148.00m,   80),
            ("Bridgestone Turanza T005",   "Premium touring tire for comfort and fuel efficiency.",      122.75m,  100),
            ("Continental UltraContact",  "High-performance tire for dry and wet roads.",               135.50m,   70),
            ("Bosch S5 70Ah Battery",      "Maintenance-free AGM battery with high CCA.",               115.00m,   50),
            ("Varta Blue Dynamic 60Ah",    "Reliable starter battery for standard vehicles.",             88.00m,   90),
            ("Brembo Front Brake Pads",    "OEM-quality ceramic brake pads for enhanced stopping.",       59.99m,  200),
            ("TRW Rear Brake Discs",       "Ventilated disc rotors with corrosion-resistant coating.",    74.50m,  150),
            ("Mann-Filter Oil Filter",     "High-flow oil filter for extended service intervals.",         9.99m,  500),
            ("Bosch Air Filter",           "Multi-layer air filter for engines up to 2.5L.",              14.50m,  400),
            ("Philips X-tremeUltinon H7",  "LED headlight upgrade — 250% brighter than halogen.",        89.00m,  120),
            ("Osram Night Breaker H4",     "Halogen bulb with 150% more light output.",                  22.00m,  350),
            ("Meguiar's Complete Care Kit","Car wash, wax, and interior cleaner bundle.",                 38.00m,  220),
            ("Bosch AEROTWIN Wiper Set",   "Frameless flat blade wiper for streak-free visibility.",     28.50m,  280),
            ("Prestone Antifreeze",        "Concentrated coolant for aluminium and alloy engines.",       18.00m,  300),
            ("Monroe Shock Absorbers",     "OEM replacement shocks for improved ride quality.",           95.00m,   60),
            ("Sachs Clutch Kit",           "Complete clutch replacement kit incl. pressure plate.",     185.00m,   40),
            ("Hella Reversing Camera",     "170° wide-angle parking camera with night vision.",           55.00m,  110)
        };

        var products = new List<Product>();

        for (var i = 0; i < 200; i++)
        {
            ct.ThrowIfCancellationRequested();

            var template = productTemplates[i % productTemplates.Length];
            var suffix   = i / productTemplates.Length; // variation suffix
            var name     = suffix == 0 ? template.Item1 : $"{template.Item1} v{suffix + 1}";

            products.Add(new Product
            {
                SellerId      = sellerIds[i % sellerIds.Count],
                CategoryId    = categoryIds[i % categoryIds.Count],
                Name          = name,
                Description   = template.Item2,
                Price         = Math.Round(template.Item3 * (1m + (decimal)(rng.NextDouble() * 0.2 - 0.1)), 2),
                StockQuantity = rng.Next(10, template.Item4)
            });
        }

        await dbContext.Products.AddRangeAsync(products, ct);
        await dbContext.SaveChangesAsync(ct);

        return await dbContext.Products.AsNoTracking().Select(p => p.Id).ToListAsync(ct);
    }

    // ─── 5. Orders + OrderItems ───────────────────────────────────────────────

    private async Task SeedOrdersAsync(
        Random rng, List<string> clientIds, List<Guid> productIds, CancellationToken ct)
    {
        if (await dbContext.Orders.CountAsync(ct) >= 200) return;
        if (clientIds.Count == 0 || productIds.Count == 0) return;

        var daysBack = 365;

        for (var i = 0; i < 200; i++)
        {
            ct.ThrowIfCancellationRequested();

            var orderStatus   = OrderStatuses[rng.Next(OrderStatuses.Length)];
            var paymentStatus = orderStatus == OrderStatus.Cancelled
                ? PaymentStatus.Failed
                : PaymentStatus.Paid;

            var createdAt = DateTime.UtcNow.AddDays(-rng.Next(1, daysBack));

            var order = new Order
            {
                UserId          = clientIds[i % clientIds.Count],
                Status          = orderStatus,
                PaymentStatus   = paymentStatus,
                TotalAmount     = 0m, // will be calculated below
                PaymentIntentId = paymentStatus == PaymentStatus.Paid
                    ? $"pi_bulk_{Guid.NewGuid():N}"
                    : null
            };

            // Manually set created timestamps via shadow properties isn't available
            // so we store the order and then add items
            await dbContext.Orders.AddAsync(order, ct);
            await dbContext.SaveChangesAsync(ct);

            // 1–3 order items per order
            var itemCount  = rng.Next(1, 4);
            var usedProdIds = new HashSet<Guid>();
            var orderTotal  = 0m;

            for (var j = 0; j < itemCount; j++)
            {
                Guid prodId;
                var attempts = 0;
                do { prodId = productIds[rng.Next(productIds.Count)]; }
                while (!usedProdIds.Add(prodId) && ++attempts < 10);

                var product = await dbContext.Products.AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == prodId, ct);
                if (product is null) continue;

                var qty       = rng.Next(1, 4);
                var unitPrice = product.Price;
                orderTotal   += qty * unitPrice;

                await dbContext.OrderItems.AddAsync(new OrderItem
                {
                    OrderId   = order.Id,
                    ProductId = prodId,
                    Quantity  = qty,
                    UnitPrice = unitPrice
                }, ct);
            }

            // Update the order total
            order.TotalAmount = Math.Round(orderTotal, 2);
            dbContext.Orders.Update(order);
            await dbContext.SaveChangesAsync(ct);
        }
    }

    // ─── 6. TrafficReports ────────────────────────────────────────────────────

    private async Task SeedTrafficReportsAsync(
        Random rng, List<string> clientIds, List<Guid> vehicleIds, CancellationToken ct)
    {
        if (await dbContext.TrafficReports.CountAsync(ct) >= 200) return;
        if (clientIds.Count == 0) return;

        var reports = new List<TrafficReport>();
        var descriptions = new[]
        {
            "Signal is stuck on red causing long queues in both directions.",
            "Large pothole has formed following heavy rain — vehicles swerving.",
            "Fallen palm tree blocking the right lane completely.",
            "Underpass flooded; no entry signs missing.",
            "Witnessed vehicle driving against traffic direction at high speed.",
            "Multi-vehicle collision; debris across two lanes.",
            "Construction zone with no visible warning signs or barriers.",
            "Double-parked trucks narrowing road to single lane.",
            "Vehicle abandoned on hard shoulder creating bottleneck.",
            "Storm debris (branches and gravel) scattered across road.",
            "Speed bump severely damaged — risk to low-clearance vehicles.",
            "Guardrail completely missing on bridge approach.",
            "Uncovered manhole in middle of lane — hazardous at night.",
            "Lane markings completely worn; drivers changing lanes unsafely.",
            "Street sign obscured by overgrown tree — navigation confusion.",
            "Blind intersection — vehicles cannot see cross traffic."
        };

        for (var i = 0; i < 200; i++)
        {
            ct.ThrowIfCancellationRequested();
            reports.Add(new TrafficReport
            {
                ReporterId  = clientIds[i % clientIds.Count],
                VehicleId   = vehicleIds.Count > 0 && rng.NextDouble() > 0.3
                                ? vehicleIds[i % vehicleIds.Count]
                                : null,
                Title       = ReportTitles[i % ReportTitles.Length],
                Description = descriptions[i % descriptions.Length],
                Location    = CairoLocations[rng.Next(CairoLocations.Length)],
                IsResolved  = rng.NextDouble() < 0.35,
                IsVerified  = rng.NextDouble() < 0.6
            });
        }

        await dbContext.TrafficReports.AddRangeAsync(reports, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    // ─── 7. TrafficIncidents ──────────────────────────────────────────────────

    private async Task SeedTrafficIncidentsAsync(Random rng, CancellationToken ct)
    {
        if (await dbContext.TrafficIncidents.CountAsync(ct) >= 200) return;

        var incidents = new List<TrafficIncident>();

        for (var i = 0; i < 200; i++)
        {
            ct.ThrowIfCancellationRequested();
            incidents.Add(new TrafficIncident
            {
                Title      = $"{IncidentTitles[i % IncidentTitles.Length]} #{i + 1}",
                Location   = CairoLocations[rng.Next(CairoLocations.Length)],
                Severity   = Severities[rng.Next(Severities.Length)],
                IsResolved = rng.NextDouble() < 0.4
            });
        }

        await dbContext.TrafficIncidents.AddRangeAsync(incidents, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    // ─── 8. SensorData ────────────────────────────────────────────────────────

    private async Task SeedSensorDataAsync(
        Random rng, List<Guid> vehicleIds, CancellationToken ct)
    {
        if (await dbContext.SensorData.CountAsync(ct) >= 200) return;
        if (vehicleIds.Count == 0) return;

        var sensorRecords = new List<SensorData>();

        for (var i = 0; i < 200; i++)
        {
            ct.ThrowIfCancellationRequested();

            // Temperature: 18–45 °C (Cairo range)
            var temp     = Math.Round((decimal)(18 + rng.NextDouble() * 27), 1);
            // Humidity:   20–85 %
            var humidity = Math.Round((decimal)(20 + rng.NextDouble() * 65), 1);
            // AQI:        30–200 (WHO scale)
            var aqi      = Math.Round((decimal)(30  + rng.NextDouble() * 170), 1);

            sensorRecords.Add(new SensorData
            {
                VehicleId          = vehicleIds[i % vehicleIds.Count],
                TemperatureCelsius = temp,
                HumidityPercentage = humidity,
                AirQualityIndex    = aqi,
                CapturedAtUtc      = DateTime.UtcNow
                                        .AddDays(-rng.Next(0, 60))
                                        .AddHours(-rng.Next(0, 24))
                                        .AddMinutes(-rng.Next(0, 60))
            });
        }

        await dbContext.SensorData.AddRangeAsync(sensorRecords, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static string GenerateUniquePlate(Random rng, HashSet<string> used)
    {
        string plate;
        var regions = new[] { "CA", "GZ", "AL", "QA", "MN", "SH", "SM", "IS", "PT", "SZ" };
        do
        {
            plate = $"{regions[rng.Next(regions.Length)]}-{rng.Next(1000, 9999)}";
        }
        while (!used.Add(plate));
        return plate;
    }

    private async Task<List<string>> GetUserIdsByRoleAsync(string role, CancellationToken ct)
    {
        // Get all users in the given role via UserManager
        var users = await userManager.GetUsersInRoleAsync(role);
        return users.Select(u => u.Id).ToList();
    }
}
