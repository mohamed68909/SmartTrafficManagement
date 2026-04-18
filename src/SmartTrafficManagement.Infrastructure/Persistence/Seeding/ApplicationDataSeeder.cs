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

        var adminEmail = seedOptions.Value.Admin.Email;
        var adminUser = await GetRequiredUserByEmailAsync(adminEmail);
        var sellerUser = await GetRequiredUserByEmailAsync("seller@test.com");
        var providerUser = await GetRequiredUserByEmailAsync("provider@test.com");
        var driverUser = await GetRequiredUserByEmailAsync("driver@test.com");

        if (!await dbContext.Categories.AnyAsync(cancellationToken))
        {
            await dbContext.Categories.AddRangeAsync(new[]
            {
                new Category { Name = "Engine Oils", Description = "Synthetic and semi-synthetic engine oils." },
                new Category { Name = "Tires", Description = "Passenger and SUV tires for city and highway driving." },
                new Category { Name = "Battery & Electrical", Description = "Batteries, chargers, and electrical accessories." }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.Vehicles.AnyAsync(cancellationToken))
        {
            await dbContext.Vehicles.AddRangeAsync(new[]
            {
                new Vehicle
                {
                    OwnerId = driverUser.Id,
                    PlateNumber = "CA-4012",
                    Make = "Toyota",
                    Brand = "Toyota",
                    Model = "Corolla",
                    Year = 2022,
                    Color = "White",
                    Type = VehicleType.Car,
                    IsDefault = true,
                    RegistrationPhotoUrl = "https://example.com/vehicles/driver-corolla.jpg"
                },
                new Vehicle
                {
                    OwnerId = adminUser.Id,
                    PlateNumber = "AD-7781",
                    Make = "Honda",
                    Brand = "Honda",
                    Model = "Civic",
                    Year = 2021,
                    Color = "Gray",
                    Type = VehicleType.Car,
                    IsDefault = true,
                    RegistrationPhotoUrl = "https://example.com/vehicles/admin-civic.jpg"
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.Products.AnyAsync(cancellationToken))
        {
            var categories = await dbContext.Categories.AsNoTracking().ToDictionaryAsync(c => c.Name, cancellationToken);
            await dbContext.Products.AddRangeAsync(new[]
            {
                new Product
                {
                    SellerId = sellerUser.Id,
                    CategoryId = categories["Engine Oils"].Id,
                    Name = "Mobil 1 5W-30 Full Synthetic",
                    Description = "High-performance synthetic oil for modern gasoline engines.",
                    Price = 48.99m,
                    StockQuantity = 120
                },
                new Product
                {
                    SellerId = sellerUser.Id,
                    CategoryId = categories["Tires"].Id,
                    Name = "Michelin Primacy 4 - 205/55R16",
                    Description = "Low-noise touring tire with improved wet braking performance.",
                    Price = 134.50m,
                    StockQuantity = 60
                },
                new Product
                {
                    SellerId = sellerUser.Id,
                    CategoryId = categories["Battery & Electrical"].Id,
                    Name = "Bosch S5 Car Battery 70Ah",
                    Description = "Reliable maintenance-free battery with high cold-cranking power.",
                    Price = 110.00m,
                    StockQuantity = 35
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.ServiceRequests.AnyAsync(cancellationToken))
        {
            var defaultVehicle = await dbContext.Vehicles
                .AsNoTracking()
                .FirstAsync(v => v.OwnerId == driverUser.Id, cancellationToken);

            await dbContext.ServiceRequests.AddRangeAsync(new[]
            {
                new ServiceRequest
                {
                    ClientId = driverUser.Id,
                    ProviderId = providerUser.Id,
                    VehicleId = defaultVehicle.Id,
                    ServiceType = ServiceType.Maintenance,
                    Status = RequestStatus.Accepted,
                    Description = "Periodic maintenance including oil and filter replacement.",
                    RequestedAtUtc = DateTime.UtcNow.AddDays(-3),
                    ScheduledAtUtc = DateTime.UtcNow.AddDays(1),
                    EstimatedCost = 85.00m,
                    Latitude = 30.0444m,
                    Longitude = 31.2357m
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.Orders.AnyAsync(cancellationToken))
        {
            var products = await dbContext.Products.AsNoTracking().ToListAsync(cancellationToken);
            var oil = products.First(p => p.Name.Contains("Mobil 1"));
            var battery = products.First(p => p.Name.Contains("Bosch"));
            var orderTotal = (2 * oil.Price) + battery.Price;

            var order = new Order
            {
                UserId = driverUser.Id,
                Status = OrderStatus.Processing,
                PaymentStatus = PaymentStatus.Paid,
                TotalAmount = orderTotal,
                PaymentIntentId = "pi_demo_order_driver_001"
            };

            await dbContext.Orders.AddAsync(order, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            await dbContext.OrderItems.AddRangeAsync(new[]
            {
                new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = oil.Id,
                    Quantity = 2,
                    UnitPrice = oil.Price
                },
                new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = battery.Id,
                    Quantity = 1,
                    UnitPrice = battery.Price
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.Transactions.AnyAsync(cancellationToken))
        {
            var order = await dbContext.Orders.AsNoTracking().FirstAsync(cancellationToken);
            var serviceRequest = await dbContext.ServiceRequests.AsNoTracking().FirstAsync(cancellationToken);

            await dbContext.Transactions.AddRangeAsync(new[]
            {
                new Transaction
                {
                    UserId = driverUser.Id,
                    OrderId = order.Id,
                    Type = TransactionType.ProductPurchase,
                    Status = PaymentStatus.Paid,
                    Amount = order.TotalAmount,
                    Currency = "usd",
                    StripePaymentIntentId = "pi_demo_tx_order_001"
                },
                new Transaction
                {
                    UserId = driverUser.Id,
                    ServiceRequestId = serviceRequest.Id,
                    Type = TransactionType.ServicePayment,
                    Status = PaymentStatus.Pending,
                    Amount = serviceRequest.EstimatedCost,
                    Currency = "usd",
                    StripePaymentIntentId = "pi_demo_tx_service_001"
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.UserCards.AnyAsync(cancellationToken))
        {
            await dbContext.UserCards.AddAsync(new UserCard
            {
                UserId = driverUser.Id,
                HolderName = "Layla Driver",
                Last4 = "4242",
                Brand = "Visa",
                ExpMonth = 12,
                ExpYear = DateTime.UtcNow.Year + 2,
                StripePaymentMethodId = "pm_demo_driver_001",
                IsDefault = true
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.CartItems.AnyAsync(cancellationToken))
        {
            var tireProduct = await dbContext.Products.AsNoTracking().FirstAsync(p => p.Name.Contains("Michelin"), cancellationToken);
            await dbContext.CartItems.AddAsync(new CartItem
            {
                UserId = driverUser.Id,
                ProductId = tireProduct.Id,
                Quantity = 1,
                UnitPrice = tireProduct.Price
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.SupportTickets.AnyAsync(cancellationToken))
        {
            var ticket = new SupportTicket
            {
                UserId = driverUser.Id,
                Subject = "Delay in order delivery",
                Description = "Order status has been processing for over 24 hours. Need ETA.",
                Status = TicketStatus.InProgress,
                Priority = TicketPriority.Medium
            };

            await dbContext.SupportTickets.AddAsync(ticket, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            await dbContext.ChatMessages.AddRangeAsync(new[]
            {
                new ChatMessage
                {
                    SupportTicketId = ticket.Id,
                    SenderId = driverUser.Id,
                    Message = "Hello, can you share the expected delivery window?",
                    Type = ChatMessageType.Text,
                    IsRead = true,
                    SentOnUtc = DateTime.UtcNow.AddHours(-6)
                },
                new ChatMessage
                {
                    SupportTicketId = ticket.Id,
                    SenderId = adminUser.Id,
                    Message = "Thanks for reaching out. Your order is being packed and should ship today.",
                    Type = ChatMessageType.Text,
                    IsRead = false,
                    SentOnUtc = DateTime.UtcNow.AddHours(-5)
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.TrafficIncidents.AnyAsync(cancellationToken))
        {
            await dbContext.TrafficIncidents.AddRangeAsync(new[]
            {
                new TrafficIncident
                {
                    Title = "Minor collision near Ring Road",
                    Location = "Cairo Ring Road Exit 12",
                    Severity = IncidentSeverity.Medium,
                    IsResolved = false
                },
                new TrafficIncident
                {
                    Title = "Heavy congestion due to roadworks",
                    Location = "6th of October Bridge Eastbound",
                    Severity = IncidentSeverity.High,
                    IsResolved = false
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.TrafficReports.AnyAsync(cancellationToken))
        {
            var driverVehicle = await dbContext.Vehicles.AsNoTracking().FirstAsync(v => v.OwnerId == driverUser.Id, cancellationToken);

            await dbContext.TrafficReports.AddAsync(new TrafficReport
            {
                ReporterId = driverUser.Id,
                VehicleId = driverVehicle.Id,
                Title = "Broken traffic light at main junction",
                Description = "Signal is stuck on red causing long queues in both directions.",
                Location = "Nasr City - Abbas El Akkad Junction",
                IsResolved = false,
                IsVerified = true
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        if (!await dbContext.SensorData.AnyAsync(cancellationToken))
        {
            var driverVehicle = await dbContext.Vehicles.AsNoTracking().FirstAsync(v => v.OwnerId == driverUser.Id, cancellationToken);

            await dbContext.SensorData.AddRangeAsync(new[]
            {
                new SensorData
                {
                    VehicleId = driverVehicle.Id,
                    TemperatureCelsius = 31.5m,
                    HumidityPercentage = 41.2m,
                    AirQualityIndex = 78.4m,
                    CapturedAtUtc = DateTime.UtcNow.AddMinutes(-30)
                },
                new SensorData
                {
                    VehicleId = driverVehicle.Id,
                    TemperatureCelsius = 30.9m,
                    HumidityPercentage = 43.0m,
                    AirQualityIndex = 74.1m,
                    CapturedAtUtc = DateTime.UtcNow.AddMinutes(-10)
                }
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<ApplicationUser> GetRequiredUserByEmailAsync(string email)
    {
        return await userManager.FindByEmailAsync(email)
            ?? throw new InvalidOperationException($"Required seeded user '{email}' was not found.");
    }

}
