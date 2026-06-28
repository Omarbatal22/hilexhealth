using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("patients");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.FirstName)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.LastName)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.PhoneNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(p => p.BiologicalSex)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(p => p.BloodType)
            .HasMaxLength(5);

        builder.Property(p => p.EmergencyContactName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.EmergencyContactPhone)
            .HasMaxLength(20)
            .IsRequired();

        // 1:N relationship with Symptoms
        builder.HasMany(p => p.Symptoms)
            .WithOne(s => s.Patient)
            .HasForeignKey(s => s.PatientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
