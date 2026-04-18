namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class UserCardConfiguration : IEntityTypeConfiguration<UserCard>
{
    public void Configure(EntityTypeBuilder<UserCard> builder)
    {
        builder.ToTable("UserCards");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.HolderName).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Last4).HasMaxLength(4).IsRequired();
        builder.Property(x => x.Brand).HasMaxLength(50).IsRequired();
        builder.Property(x => x.StripePaymentMethodId).HasMaxLength(120).IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(x => x.UserCards)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
