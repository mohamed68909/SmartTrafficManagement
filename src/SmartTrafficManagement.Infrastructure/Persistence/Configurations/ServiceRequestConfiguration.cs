namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> builder)
    {
        builder.ToTable("ServiceRequests");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ServiceType).HasConversion<int>().IsRequired();
        builder.Property(x => x.Status).HasConversion<int>().IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.EstimatedCost).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Latitude).HasColumnType("decimal(9,6)");
        builder.Property(x => x.Longitude).HasColumnType("decimal(9,6)");

        builder.HasOne(x => x.Client)
            .WithMany(x => x.ClientServiceRequests)
            .HasForeignKey(x => x.ClientId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.Provider)
            .WithMany(x => x.ProviderServiceRequests)
            .HasForeignKey(x => x.ProviderId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.Vehicle)
            .WithMany(x => x.ServiceRequests)
            .HasForeignKey(x => x.VehicleId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
