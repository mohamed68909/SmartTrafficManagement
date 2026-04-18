namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
{
    public void Configure(EntityTypeBuilder<SupportTicket> builder)
    {
        builder.ToTable("SupportTickets");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Subject).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.Status).HasConversion<int>().IsRequired();
        builder.Property(x => x.Priority).HasConversion<int>().IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(x => x.SupportTickets)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
