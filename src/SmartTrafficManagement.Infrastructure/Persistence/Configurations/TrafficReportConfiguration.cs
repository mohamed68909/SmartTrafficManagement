namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class TrafficReportConfiguration : IEntityTypeConfiguration<TrafficReport>
{
    public void Configure(EntityTypeBuilder<TrafficReport> builder)
    {
        builder.ToTable("TrafficReports");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1500).IsRequired();
        builder.Property(x => x.Location).HasMaxLength(250).IsRequired();
        builder.Property(x => x.IsVerified).HasDefaultValue(false);

        builder.HasOne(x => x.Reporter)
            .WithMany(x => x.TrafficReports)
            .HasForeignKey(x => x.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Vehicle)
            .WithMany()
            .HasForeignKey(x => x.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.ReporterId);
        builder.HasIndex(x => x.VehicleId);
    }
}
