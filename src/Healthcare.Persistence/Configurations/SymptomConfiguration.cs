using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class SymptomConfiguration : IEntityTypeConfiguration<Symptom>
{
    public void Configure(EntityTypeBuilder<Symptom> builder)
    {
        builder.ToTable("symptoms");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Description)
            .IsRequired();

        builder.Property(s => s.AiTriageResult)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasOne(s => s.Patient)
            .WithMany(p => p.Symptoms)
            .HasForeignKey(s => s.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.LoggedAt);
        builder.HasIndex(s => s.PatientId);
    }
}
