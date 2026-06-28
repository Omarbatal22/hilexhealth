using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.ToTable("doctors");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.FirstName)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(d => d.LastName)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(d => d.PhoneNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(d => d.Specialty)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(d => d.LicenseNumber)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique();
    }
}
