namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class SensorDataConfiguration : IEntityTypeConfiguration<SensorData>
{
    public void Configure(EntityTypeBuilder<SensorData> builder)
    {
        builder.ToTable("SensorData");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.TemperatureCelsius).HasColumnType("decimal(6,2)");
        builder.Property(x => x.HumidityPercentage).HasColumnType("decimal(6,2)");
        builder.Property(x => x.AirQualityIndex).HasColumnType("decimal(10,2)");
        builder.Property(x => x.CapturedAtUtc).IsRequired();

        builder.HasOne(x => x.Vehicle)
            .WithMany(x => x.SensorDataRecords)
            .HasForeignKey(x => x.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.VehicleId, x.CapturedAtUtc });
    }
}
