namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class TrafficIncidentConfiguration : IEntityTypeConfiguration<TrafficIncident>
{
    public void Configure(EntityTypeBuilder<TrafficIncident> builder)
    {
        builder.ToTable("TrafficIncidents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(x => x.Location)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Severity)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.IsResolved)
            .HasDefaultValue(false);
    }
}
