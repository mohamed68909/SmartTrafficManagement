namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlateNumber).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Make).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Brand).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Model).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Color).HasMaxLength(50).IsRequired();
        builder.Property(x => x.RegistrationPhotoUrl).HasMaxLength(500);
        builder.Property(x => x.Type).HasConversion<int>().IsRequired();
        builder.Property(x => x.IsDefault).HasDefaultValue(false);
        builder.Property(x => x.IsDeleted).HasDefaultValue(false);

        builder.HasIndex(x => x.PlateNumber).IsUnique();
        builder.HasIndex(x => x.OwnerId);

        builder.HasOne(x => x.Owner)
            .WithMany(x => x.Vehicles)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
