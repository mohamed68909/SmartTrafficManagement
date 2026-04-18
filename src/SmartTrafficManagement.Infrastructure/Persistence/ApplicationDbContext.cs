using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace SmartTrafficManagement.Infrastructure.Persistence;

public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TrafficIncident> TrafficIncidents => Set<TrafficIncident>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<UserCard> UserCards => Set<UserCard>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TrafficReport> TrafficReports => Set<TrafficReport>();
    public DbSet<SensorData> SensorData => Set<SensorData>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Rating> Ratings => Set<Rating>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
