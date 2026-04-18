namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("ChatMessages");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Message).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.Type).HasConversion<int>().IsRequired();

        builder.HasOne(x => x.SupportTicket)
            .WithMany(x => x.ChatMessages)
            .HasForeignKey(x => x.SupportTicketId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Sender)
            .WithMany(x => x.ChatMessages)
            .HasForeignKey(x => x.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
