namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type).HasConversion<int>().IsRequired();
        builder.Property(x => x.Status).HasConversion<int>().IsRequired();
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Currency).HasMaxLength(10).IsRequired();
        builder.Property(x => x.StripePaymentIntentId).HasMaxLength(120);

        builder.HasOne(x => x.User)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Order)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.ServiceRequest)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.ServiceRequestId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
