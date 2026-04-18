namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(x => x.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Points)
            .HasDefaultValue(0);

        builder.Property(x => x.IsPremium)
            .HasDefaultValue(false);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.StripeCustomerId)
            .HasMaxLength(100);

        builder.Property(x => x.ProfilePicture)
            .HasMaxLength(500);
    }
}
