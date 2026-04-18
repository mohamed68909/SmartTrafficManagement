namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).HasConversion<int>().IsRequired();
        builder.Property(x => x.PaymentStatus).HasConversion<int>().IsRequired();
        builder.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PaymentIntentId).HasMaxLength(150);

        builder.HasOne(x => x.User)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
