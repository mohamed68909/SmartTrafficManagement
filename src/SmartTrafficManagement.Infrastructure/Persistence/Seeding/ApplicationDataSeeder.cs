using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Infrastructure.Persistence.Seeding;

internal sealed class ApplicationDataSeeder(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    IOptions<SeedOptions> seedOptions) : IDataSeeder
{
    public int Order => 200;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var ct = cancellationToken;

        // ── Resolve users required across multiple sections ────────────────────
        var adminEmail    = seedOptions.Value.Admin.Email;
        var adminUser     = await GetRequiredUserAsync(adminEmail,            ct);
        var driverUser    = await GetRequiredUserAsync("driver@test.com",     ct);
        var hassanUser    = await GetRequiredUserAsync("m.hassan@mail.eg",    ct);
        var linaUser      = await GetRequiredUserAsync("lina@mail.eg",        ct);
        var youssefUser   = await GetRequiredUserAsync("youssef@mail.eg",     ct);
        var saraUser      = await GetRequiredUserAsync("sara@mail.eg",        ct);
        var khaledUser    = await GetRequiredUserAsync("khaled@mail.eg",      ct);
        var nourUser      = await GetRequiredUserAsync("nour@mail.eg",        ct);
        var layla2User    = await GetRequiredUserAsync("layla2@mail.eg",      ct);
        var ahmedUser     = await GetRequiredUserAsync("ahmed@mail.eg",       ct);
        var sellerUser    = await GetRequiredUserAsync("seller@test.com",     ct);
        var providerUser  = await GetRequiredUserAsync("provider@test.com",   ct);
        var fuelUser      = await GetRequiredUserAsync("fuel@express.eg",     ct);
        var saraAgentUser = await GetRequiredUserAsync("sara@smarttraffic.io",ct);

        // ══════════════════════════════════════════════════════════════════════
        // Section 1 — Categories
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.Categories.AnyAsync(ct))
        {
            await dbContext.Categories.AddRangeAsync(new[]
            {
                new Category
                {
                    Name        = "Engine Oils",
                    Description = "Synthetic and semi-synthetic engine oils for all vehicle types."
                },
                new Category
                {
                    Name        = "Tires",
                    Description = "Passenger and SUV tires for city and highway driving."
                },
                new Category
                {
                    Name        = "Battery & Electrical",
                    Description = "Batteries, chargers, and electrical accessories."
                },
                new Category
                {
                    Name        = "Brake Parts",
                    Description = "Brake pads, discs, calipers, and brake fluids."
                },
                new Category
                {
                    Name        = "Filters",
                    Description = "Air, oil, fuel, and cabin filters for all vehicles."
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 2 — Vehicles
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.Vehicles.AnyAsync(ct))
        {
            await dbContext.Vehicles.AddRangeAsync(new[]
            {
                new Vehicle
                {
                    OwnerId              = driverUser.Id,
                    Make                 = "Toyota",
                    Brand                = "Toyota",
                    Model                = "Corolla",
                    Year                 = 2022,
                    PlateNumber          = "CA-4012",
                    Color                = "White",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
                new Vehicle
                {
                    OwnerId              = adminUser.Id,
                    Make                 = "Honda",
                    Brand                = "Honda",
                    Model                = "Civic",
                    Year                 = 2021,
                    PlateNumber          = "AD-7781",
                    Color                = "Gray",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
                new Vehicle
                {
                    OwnerId              = hassanUser.Id,
                    Make                 = "Toyota",
                    Brand                = "Toyota",
                    Model                = "Camry",
                    Year                 = 2023,
                    PlateNumber          = "MH-2345",
                    Color                = "Silver",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
                new Vehicle
                {
                    OwnerId              = linaUser.Id,
                    Make                 = "Honda",
                    Brand                = "Honda",
                    Model                = "Civic",
                    Year                 = 2022,
                    PlateNumber          = "LA-1122",
                    Color                = "White",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
                new Vehicle
                {
                    OwnerId              = youssefUser.Id,
                    Make                 = "Kia",
                    Brand                = "Kia",
                    Model                = "Sportage",
                    Year                 = 2021,
                    PlateNumber          = "YS-3344",
                    Color                = "Black",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
                new Vehicle
                {
                    OwnerId              = saraUser.Id,
                    Make                 = "Hyundai",
                    Brand                = "Hyundai",
                    Model                = "Elantra",
                    Year                 = 2022,
                    PlateNumber          = "SA-5566",
                    Color                = "Red",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
                new Vehicle
                {
                    OwnerId              = khaledUser.Id,
                    Make                 = "Nissan",
                    Brand                = "Nissan",
                    Model                = "Sunny",
                    Year                 = 2020,
                    PlateNumber          = "KA-7788",
                    Color                = "Gray",
                    Type                 = VehicleType.Car,
                    IsDefault            = true,
                    RegistrationPhotoUrl = $"https://cdn.smarttraffic.dev/vehicles/{Guid.NewGuid():N}.jpg"
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 3 — Products
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.Products.AnyAsync(ct))
        {
            var categories = await dbContext.Categories
                .AsNoTracking()
                .ToDictionaryAsync(c => c.Name, ct);

            await dbContext.Products.AddRangeAsync(new[]
            {
                new Product
                {
                    SellerId      = sellerUser.Id,
                    CategoryId    = categories["Engine Oils"].Id,
                    Name          = "Mobil 1 5W-30 Full Synthetic",
                    Description   = "High-performance full synthetic motor oil for modern engines.",
                    Price         = 48.99m,
                    StockQuantity = 120
                },
                new Product
                {
                    SellerId      = sellerUser.Id,
                    CategoryId    = categories["Tires"].Id,
                    Name          = "Michelin Primacy 4 - 205/55R16",
                    Description   = "Low-noise touring tire with improved wet braking performance.",
                    Price         = 134.50m,
                    StockQuantity = 60
                },
                new Product
                {
                    SellerId      = sellerUser.Id,
                    CategoryId    = categories["Battery & Electrical"].Id,
                    Name          = "Bosch S5 Car Battery 70Ah",
                    Description   = "Reliable maintenance-free battery with high cold-cranking power.",
                    Price         = 110.00m,
                    StockQuantity = 35
                },
                new Product
                {
                    SellerId      = sellerUser.Id,
                    CategoryId    = categories["Battery & Electrical"].Id,
                    Name          = "Varta Blue Dynamic Battery 70Ah",
                    Description   = "Proven OEM-quality starter battery for everyday vehicles.",
                    Price         = 88.00m,
                    StockQuantity = 45
                },
                new Product
                {
                    SellerId      = sellerUser.Id,
                    CategoryId    = categories["Brake Parts"].Id,
                    Name          = "TRW Premium Brake Pads",
                    Description   = "Low-dust, low-noise brake pads for passenger cars.",
                    Price         = 59.99m,
                    StockQuantity = 80
                },
                new Product
                {
                    SellerId      = sellerUser.Id,
                    CategoryId    = categories["Filters"].Id,
                    Name          = "Bosch Air Filter F026400006",
                    Description   = "OE-quality air filter for improved engine performance.",
                    Price         = 14.50m,
                    StockQuantity = 200
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 4 — Service Requests
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.ServiceRequests.AnyAsync(ct))
        {
            // Resolve each client's default vehicle.
            var hassanVehicle  = await GetFirstVehicleAsync(hassanUser.Id,   ct);
            var linaVehicle    = await GetFirstVehicleAsync(linaUser.Id,     ct);
            var youssefVehicle = await GetFirstVehicleAsync(youssefUser.Id,  ct);
            var driverVehicle  = await GetFirstVehicleAsync(driverUser.Id,   ct);

            await dbContext.ServiceRequests.AddRangeAsync(new[]
            {
                new ServiceRequest
                {
                    ClientId       = hassanUser.Id,
                    ProviderId     = null,
                    VehicleId      = hassanVehicle.Id,
                    ServiceType    = ServiceType.Towing,
                    Status         = RequestStatus.Pending,
                    Description    = "Axle failure — Ring Road, Nasr",
                    EstimatedCost  = 0m,
                    Latitude       = 30.0561m,
                    Longitude      = 31.2394m,
                    RequestedAtUtc = DateTime.UtcNow.AddMinutes(-14)
                },
                new ServiceRequest
                {
                    ClientId       = linaUser.Id,
                    ProviderId     = fuelUser.Id,
                    VehicleId      = linaVehicle.Id,
                    ServiceType    = ServiceType.FuelDelivery,
                    Status         = RequestStatus.Accepted,
                    Description    = "Fuel leak — New Cairo Autostrad",
                    EstimatedCost  = 180m,
                    Latitude       = 30.0729m,
                    Longitude      = 31.4069m,
                    RequestedAtUtc = DateTime.UtcNow.AddMinutes(-8)
                },
                new ServiceRequest
                {
                    ClientId       = youssefUser.Id,
                    ProviderId     = providerUser.Id,
                    VehicleId      = youssefVehicle.Id,
                    ServiceType    = ServiceType.Towing,
                    Status         = RequestStatus.Completed,
                    Description    = "Accident — tow required — Oct 6 Bridge",
                    EstimatedCost  = 350m,
                    Latitude       = 30.0565m,
                    Longitude      = 31.2114m,
                    RequestedAtUtc = DateTime.UtcNow.AddMinutes(-120)
                },
                new ServiceRequest
                {
                    ClientId       = driverUser.Id,
                    ProviderId     = providerUser.Id,
                    VehicleId      = driverVehicle.Id,
                    ServiceType    = ServiceType.Maintenance,
                    Status         = RequestStatus.Accepted,
                    Description    = "Periodic maintenance, oil and filter change.",
                    EstimatedCost  = 85m,
                    Latitude       = 30.0444m,
                    Longitude      = 31.2357m,
                    RequestedAtUtc = DateTime.UtcNow.AddDays(-3)
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 5 — Orders + OrderItems
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.Orders.AnyAsync(ct))
        {
            var products = await dbContext.Products.AsNoTracking().ToListAsync(ct);

            var oil      = products.First(p => p.Name.Contains("Mobil 1"));
            var michelin = products.First(p => p.Name.Contains("Michelin"));
            var boschBat = products.First(p => p.Name.Contains("Bosch S5"));
            var varta    = products.First(p => p.Name.Contains("Varta"));
            var brakes   = products.First(p => p.Name.Contains("TRW"));
            var airFilter= products.First(p => p.Name.Contains("Bosch Air"));

            // Order 1 — driver
            var order1 = new Order
            {
                UserId          = driverUser.Id,
                Status          = OrderStatus.Processing,
                PaymentStatus   = PaymentStatus.Paid,
                TotalAmount     = (2 * oil.Price) + boschBat.Price,
                PaymentIntentId = "pi_demo_order_driver_001"
            };
            await dbContext.Orders.AddAsync(order1, ct);
            await dbContext.SaveChangesAsync(ct);

            await dbContext.OrderItems.AddRangeAsync(new[]
            {
                new OrderItem { OrderId = order1.Id, ProductId = oil.Id,     Quantity = 2, UnitPrice = oil.Price     },
                new OrderItem { OrderId = order1.Id, ProductId = boschBat.Id, Quantity = 1, UnitPrice = boschBat.Price }
            }, ct);
            await dbContext.SaveChangesAsync(ct);

            // Order 2 — m.hassan
            var order2 = new Order
            {
                UserId          = hassanUser.Id,
                Status          = OrderStatus.Shipped,
                PaymentStatus   = PaymentStatus.Paid,
                TotalAmount     = michelin.Price + (2 * airFilter.Price),
                PaymentIntentId = "pi_demo_order_hassan_001"
            };
            await dbContext.Orders.AddAsync(order2, ct);
            await dbContext.SaveChangesAsync(ct);

            await dbContext.OrderItems.AddRangeAsync(new[]
            {
                new OrderItem { OrderId = order2.Id, ProductId = michelin.Id,  Quantity = 1, UnitPrice = michelin.Price  },
                new OrderItem { OrderId = order2.Id, ProductId = airFilter.Id, Quantity = 2, UnitPrice = airFilter.Price }
            }, ct);
            await dbContext.SaveChangesAsync(ct);

            // Order 3 — sara
            var order3 = new Order
            {
                UserId          = saraUser.Id,
                Status          = OrderStatus.Delivered,
                PaymentStatus   = PaymentStatus.Paid,
                TotalAmount     = brakes.Price,
                PaymentIntentId = "pi_demo_order_sara_001"
            };
            await dbContext.Orders.AddAsync(order3, ct);
            await dbContext.SaveChangesAsync(ct);

            await dbContext.OrderItems.AddAsync(
                new OrderItem { OrderId = order3.Id, ProductId = brakes.Id, Quantity = 1, UnitPrice = brakes.Price }, ct);
            await dbContext.SaveChangesAsync(ct);

            // Order 4 — khaled
            var order4 = new Order
            {
                UserId          = khaledUser.Id,
                Status          = OrderStatus.Cancelled,
                PaymentStatus   = PaymentStatus.Failed,
                TotalAmount     = 2 * varta.Price,
                PaymentIntentId = null
            };
            await dbContext.Orders.AddAsync(order4, ct);
            await dbContext.SaveChangesAsync(ct);

            await dbContext.OrderItems.AddAsync(
                new OrderItem { OrderId = order4.Id, ProductId = varta.Id, Quantity = 2, UnitPrice = varta.Price }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 6 — Transactions
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.Transactions.AnyAsync(ct))
        {
            // Resolve orders by user + payment intent to match deterministically.
            var order1 = await dbContext.Orders.AsNoTracking()
                .FirstAsync(o => o.UserId == driverUser.Id && o.PaymentIntentId == "pi_demo_order_driver_001", ct);
            var order2 = await dbContext.Orders.AsNoTracking()
                .FirstAsync(o => o.UserId == hassanUser.Id && o.PaymentIntentId == "pi_demo_order_hassan_001", ct);

            // Resolve driver's service request.
            var driverServiceReq = await dbContext.ServiceRequests.AsNoTracking()
                .FirstAsync(s => s.ClientId == driverUser.Id && s.ServiceType == ServiceType.Maintenance, ct);

            await dbContext.Transactions.AddRangeAsync(new[]
            {
                new Transaction
                {
                    UserId                = driverUser.Id,
                    OrderId               = order1.Id,
                    Type                  = TransactionType.ProductPurchase,
                    Status                = PaymentStatus.Paid,
                    Amount                = order1.TotalAmount,
                    Currency              = "usd",
                    StripePaymentIntentId = "pi_demo_tx_order_001"
                },
                new Transaction
                {
                    UserId                = driverUser.Id,
                    ServiceRequestId      = driverServiceReq.Id,
                    Type                  = TransactionType.ServicePayment,
                    Status                = PaymentStatus.Pending,
                    Amount                = 85.00m,
                    Currency              = "usd",
                    StripePaymentIntentId = "pi_demo_tx_service_001"
                },
                new Transaction
                {
                    UserId                = hassanUser.Id,
                    OrderId               = order2.Id,
                    Type                  = TransactionType.ProductPurchase,
                    Status                = PaymentStatus.Paid,
                    Amount                = order2.TotalAmount,
                    Currency              = "usd",
                    StripePaymentIntentId = "pi_demo_tx_order_hassan_001"
                }
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 7 — User Cards
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.UserCards.AnyAsync(ct))
        {
            await dbContext.UserCards.AddRangeAsync(new[]
            {
                new UserCard
                {
                    UserId                = driverUser.Id,
                    HolderName            = "Layla Driver",
                    Last4                 = "4242",
                    Brand                 = "Visa",
                    ExpMonth              = 12,
                    ExpYear               = DateTime.UtcNow.Year + 2,
                    StripePaymentMethodId = "pm_demo_driver_001",
                    IsDefault             = true
                },
                new UserCard
                {
                    UserId                = hassanUser.Id,
                    HolderName            = "Mohamed Hassan",
                    Last4                 = "1234",
                    Brand                 = "Mastercard",
                    ExpMonth              = 6,
                    ExpYear               = DateTime.UtcNow.Year + 1,
                    StripePaymentMethodId = "pm_demo_hassan_001",
                    IsDefault             = true
                }
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 8 — Cart Items
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.CartItems.AnyAsync(ct))
        {
            var michelin  = await dbContext.Products.AsNoTracking()
                .FirstAsync(p => p.Name.Contains("Michelin"), ct);
            var airFilter = await dbContext.Products.AsNoTracking()
                .FirstAsync(p => p.Name.Contains("Bosch Air"), ct);

            await dbContext.CartItems.AddRangeAsync(new[]
            {
                new CartItem
                {
                    UserId    = driverUser.Id,
                    ProductId = michelin.Id,
                    Quantity  = 1,
                    UnitPrice = michelin.Price
                },
                new CartItem
                {
                    UserId    = hassanUser.Id,
                    ProductId = airFilter.Id,
                    Quantity  = 2,
                    UnitPrice = airFilter.Price
                }
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 9 — Support Tickets + Chat Messages
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.SupportTickets.AnyAsync(ct))
        {
            // ── Ticket 1 — m.hassan (gets chat messages) ──────────────────────
            var ticket1 = new SupportTicket
            {
                UserId   = hassanUser.Id,
                Subject  = "Payment not processed — Vodafone Cash",
                Description = "Paid via Vodafone Cash but account was not activated.",
                Status   = TicketStatus.Open,
                Priority = TicketPriority.Urgent
            };
            await dbContext.SupportTickets.AddAsync(ticket1, ct);
            await dbContext.SaveChangesAsync(ct);

            // Chat messages for Ticket 1
            await dbContext.ChatMessages.AddRangeAsync(new[]
            {
                new ChatMessage
                {
                    SupportTicketId = ticket1.Id,
                    SenderId        = hassanUser.Id,
                    Type            = ChatMessageType.Text,
                    Message         = "Hello, I paid 450 EGP via Vodafone Cash for SmartTraffic Premium but my account was not activated. Transaction ref: VF-998342. Please help!",
                    IsRead          = true,
                    SentOnUtc       = DateTime.UtcNow.AddMinutes(-12)
                },
                new ChatMessage
                {
                    SupportTicketId = ticket1.Id,
                    SenderId        = saraAgentUser.Id,
                    Type            = ChatMessageType.Text,
                    Message         = "Hi Mohamed! Thank you for reaching out. I am Sarah from SmartTraffic support. I am looking into your payment now — could you confirm the phone number used for the Vodafone Cash payment?",
                    IsRead          = true,
                    SentOnUtc       = DateTime.UtcNow.AddMinutes(-10)
                },
                new ChatMessage
                {
                    SupportTicketId = ticket1.Id,
                    SenderId        = saraAgentUser.Id,
                    Type            = ChatMessageType.System,
                    Message         = "Payment gateway verified — VF-998342 shows a successful debit on the customer side. Likely a failed subscription activation webhook. Escalated to tech team.",
                    IsRead          = true,
                    SentOnUtc       = DateTime.UtcNow.AddMinutes(-9)
                },
                new ChatMessage
                {
                    SupportTicketId = ticket1.Id,
                    SenderId        = hassanUser.Id,
                    Type            = ChatMessageType.Text,
                    Message         = "The number I used is 01012345678. The amount was deducted from my Vodafone Cash wallet but nothing happened in the app. It has been 2 hours now.",
                    IsRead          = true,
                    SentOnUtc       = DateTime.UtcNow.AddMinutes(-8)
                },
                new ChatMessage
                {
                    SupportTicketId = ticket1.Id,
                    SenderId        = saraAgentUser.Id,
                    Type            = ChatMessageType.Text,
                    Message         = "Thank you Mohamed. I confirmed the payment — the transaction was successful. I am manually activating your subscription now. You should receive a confirmation within 2 minutes.",
                    IsRead          = true,
                    SentOnUtc       = DateTime.UtcNow.AddMinutes(-4)
                },
                new ChatMessage
                {
                    SupportTicketId = ticket1.Id,
                    SenderId        = hassanUser.Id,
                    Type            = ChatMessageType.Text,
                    Message         = "Thank you so much! I checked the app and it now shows Premium. I really appreciate the fast help!",
                    IsRead          = false,
                    SentOnUtc       = DateTime.UtcNow.AddMinutes(-2)
                }
            }, ct);
            await dbContext.SaveChangesAsync(ct);

            // ── Remaining tickets (no chat messages) ──────────────────────────
            await dbContext.SupportTickets.AddRangeAsync(new[]
            {
                new SupportTicket
                {
                    UserId      = khaledUser.Id,
                    Subject     = "Provider delayed by 35 minutes",
                    Description = "Requested provider arrived 35 minutes late without prior notice.",
                    Status      = TicketStatus.InProgress,
                    Priority    = TicketPriority.High
                },
                new SupportTicket
                {
                    UserId      = nourUser.Id,
                    Subject     = "Wrong fuel type delivered — octane 95 instead of 92",
                    Description = "Provider delivered the wrong fuel type which may have damaged the engine.",
                    Status      = TicketStatus.InProgress,
                    Priority    = TicketPriority.High
                },
                new SupportTicket
                {
                    UserId      = saraUser.Id,
                    Subject     = "App crashed during payment",
                    Description = "The app closed unexpectedly at the payment confirmation screen.",
                    Status      = TicketStatus.InProgress,
                    Priority    = TicketPriority.Medium
                },
                new SupportTicket
                {
                    UserId      = layla2User.Id,
                    Subject     = "Winch provider cancelled my request without notice",
                    Description = "Provider cancelled the active towing request without any explanation.",
                    Status      = TicketStatus.Open,
                    Priority    = TicketPriority.Urgent
                },
                new SupportTicket
                {
                    UserId      = ahmedUser.Id,
                    Subject     = "Refund request — charged twice for same order",
                    Description = "Duplicate charge appeared on bank statement for a single order.",
                    Status      = TicketStatus.Open,
                    Priority    = TicketPriority.Urgent
                },
                new SupportTicket
                {
                    UserId      = driverUser.Id,
                    Subject     = "Delay in order delivery",
                    Description = "Order status has been in Processing for over 24 hours. Need ETA.",
                    Status      = TicketStatus.InProgress,
                    Priority    = TicketPriority.Medium
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 10 — Traffic Incidents
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.TrafficIncidents.AnyAsync(ct))
        {
            await dbContext.TrafficIncidents.AddRangeAsync(new[]
            {
                new TrafficIncident
                {
                    Title      = "Minor collision near Ring Road",
                    Location   = "Cairo Ring Road Exit 12",
                    Severity   = IncidentSeverity.Medium,
                    IsResolved = false
                },
                new TrafficIncident
                {
                    Title      = "Heavy congestion due to roadworks",
                    Location   = "6th of October Bridge Eastbound",
                    Severity   = IncidentSeverity.High,
                    IsResolved = false
                },
                new TrafficIncident
                {
                    Title      = "Heavy congestion near Dokki",
                    Location   = "Dokki — Tahrir Street",
                    Severity   = IncidentSeverity.High,
                    IsResolved = false
                },
                new TrafficIncident
                {
                    Title      = "Broken traffic light at junction",
                    Location   = "New Cairo — Hegaz Square",
                    Severity   = IncidentSeverity.Low,
                    IsResolved = false
                },
                new TrafficIncident
                {
                    Title      = "Car breakdown blocking lane",
                    Location   = "Maadi — Corniche El Nil",
                    Severity   = IncidentSeverity.Medium,
                    IsResolved = false
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 11 — Traffic Reports
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.TrafficReports.AnyAsync(ct))
        {
            var driverVehicle = await GetFirstVehicleAsync(driverUser.Id, ct);

            await dbContext.TrafficReports.AddRangeAsync(new[]
            {
                new TrafficReport
                {
                    ReporterId  = driverUser.Id,
                    VehicleId   = driverVehicle.Id,
                    Title       = "Broken traffic light at main junction",
                    Description = "Signal stuck on red causing long queues in both directions.",
                    Location    = "Nasr City — Abbas El Akkad Junction",
                    IsResolved  = false,
                    IsVerified  = true
                },
                new TrafficReport
                {
                    ReporterId  = driverUser.Id,
                    VehicleId   = driverVehicle.Id,
                    Title       = "Pothole hazard on road",
                    Description = "Large pothole formed after rain — vehicles swerving to avoid.",
                    Location    = "Maadi — Road 9",
                    IsResolved  = false,
                    IsVerified  = false
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Section 12 — Sensor Data
        // ══════════════════════════════════════════════════════════════════════
        if (!await dbContext.SensorData.AnyAsync(ct))
        {
            var driverVehicle = await GetFirstVehicleAsync(driverUser.Id, ct);

            await dbContext.SensorData.AddRangeAsync(new[]
            {
                new SensorData
                {
                    VehicleId          = driverVehicle.Id,
                    TemperatureCelsius = 31.5m,
                    HumidityPercentage = 41.2m,
                    AirQualityIndex    = 78.4m,
                    CapturedAtUtc      = DateTime.UtcNow.AddMinutes(-30)
                },
                new SensorData
                {
                    VehicleId          = driverVehicle.Id,
                    TemperatureCelsius = 30.9m,
                    HumidityPercentage = 43.0m,
                    AirQualityIndex    = 74.1m,
                    CapturedAtUtc      = DateTime.UtcNow.AddMinutes(-10)
                },
                new SensorData
                {
                    VehicleId          = driverVehicle.Id,
                    TemperatureCelsius = 31.0m,
                    HumidityPercentage = 72.0m,
                    AirQualityIndex    = 72.0m,
                    CapturedAtUtc      = DateTime.UtcNow.AddHours(-1)
                },
                new SensorData
                {
                    VehicleId          = driverVehicle.Id,
                    TemperatureCelsius = 33.0m,
                    HumidityPercentage = 89.0m,
                    AirQualityIndex    = 95.0m,
                    CapturedAtUtc      = DateTime.UtcNow.AddMinutes(-45)
                },
                new SensorData
                {
                    VehicleId          = driverVehicle.Id,
                    TemperatureCelsius = 27.0m,
                    HumidityPercentage = 65.0m,
                    AirQualityIndex    = 65.0m,
                    CapturedAtUtc      = DateTime.UtcNow.AddMinutes(-20)
                },
            }, ct);
            await dbContext.SaveChangesAsync(ct);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<ApplicationUser> GetRequiredUserAsync(string email, CancellationToken ct)
    {
        return await userManager.FindByEmailAsync(email)
            ?? throw new InvalidOperationException($"Required seeded user '{email}' was not found. Ensure IdentitySeeder ran first.");
    }

    private async Task<Vehicle> GetFirstVehicleAsync(string ownerId, CancellationToken ct)
    {
        return await dbContext.Vehicles
            .AsNoTracking()
            .FirstAsync(v => v.OwnerId == ownerId, ct);
    }
}
