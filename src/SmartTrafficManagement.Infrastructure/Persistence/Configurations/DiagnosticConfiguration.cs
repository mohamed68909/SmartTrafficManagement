using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Infrastructure.Persistence.Configurations;

public sealed class DiagnosticQuestionConfiguration
    : IEntityTypeConfiguration<DiagnosticQuestion>
{
    public void Configure(EntityTypeBuilder<DiagnosticQuestion> builder)
    {
        builder.ToTable("DiagnosticQuestions");
        builder.HasKey(q => q.Id);

        builder.Property(q => q.Text)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(q => q.Order).IsRequired();
        builder.Property(q => q.IsRoot).IsRequired();

        // Answers relationship configured from DiagnosticAnswerConfiguration
    }
}

public sealed class DiagnosticAnswerConfiguration
    : IEntityTypeConfiguration<DiagnosticAnswer>
{
    public void Configure(EntityTypeBuilder<DiagnosticAnswer> builder)
    {
        builder.ToTable("DiagnosticAnswers");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Text)
               .IsRequired()
               .HasMaxLength(300);

        // ── Primary relationship: Answer belongs to a Question ──────────────
        builder.HasOne(a => a.Question)
               .WithMany(q => q.Answers)
               .HasForeignKey(a => a.QuestionId)
               .OnDelete(DeleteBehavior.Cascade);

        // ── Self-referencing: Answer can point to the NEXT Question ─────────
        //    Explicitly named FK to avoid EF ambiguity with the Question above.
        builder.HasOne(a => a.NextQuestion)
               .WithMany()                     // no inverse collection on DiagnosticQuestion
               .HasForeignKey(a => a.NextQuestionId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        // ── Terminal relationship: Answer can point to a Result ──────────────
        builder.HasOne(a => a.Result)
               .WithMany()
               .HasForeignKey(a => a.ResultId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.SetNull);
    }
}

public sealed class DiagnosticResultConfiguration
    : IEntityTypeConfiguration<DiagnosticResult>
{
    public void Configure(EntityTypeBuilder<DiagnosticResult> builder)
    {
        builder.ToTable("DiagnosticResults");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(r => r.Description)
               .IsRequired()
               .HasMaxLength(1000);

        builder.Property(r => r.RecommendedServiceType)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(r => r.Urgency)
               .IsRequired()
               .HasMaxLength(20)
               .HasDefaultValue("Medium");

        builder.Property(r => r.Tip)
               .HasMaxLength(500);
    }
}
