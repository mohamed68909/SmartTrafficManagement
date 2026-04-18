namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Quantity).IsRequired();
        builder.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");

        builder.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();

        builder.HasOne(x => x.User)
            .WithMany(x => x.CartItems)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Product)
            .WithMany(x => x.CartItems)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
