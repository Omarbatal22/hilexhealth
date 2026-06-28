using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class TriageAssessmentConfiguration : IEntityTypeConfiguration<TriageAssessment>
{
    public void Configure(EntityTypeBuilder<TriageAssessment> builder)
    {
        builder.ToTable("triage_assessments");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.SymptomDescription)
            .IsRequired();

        builder.Property(t => t.ExtractedSymptoms)
            .IsRequired();

        builder.Property(t => t.Recommendation)
            .IsRequired();

        builder.HasOne(t => t.Patient)
            .WithMany()
            .HasForeignKey(t => t.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.EscalatedToDoctor)
            .WithMany()
            .HasForeignKey(t => t.EscalatedToDoctorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(t => t.PatientId);
        builder.HasIndex(t => t.UrgencyLevel);
        builder.HasIndex(t => t.IsEscalated);
        builder.HasIndex(t => t.EscalatedToDoctorId);
    }
}
