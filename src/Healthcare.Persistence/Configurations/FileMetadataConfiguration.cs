using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class FileMetadataConfiguration : IEntityTypeConfiguration<FileMetadata>
{
    public void Configure(EntityTypeBuilder<FileMetadata> builder)
    {
        builder.ToTable("file_metadata");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FileName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(f => f.StoragePath)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(f => f.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(f => f.AccessLevel)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasOne(f => f.Uploader)
            .WithMany(u => u.UploadedFiles)
            .HasForeignKey(f => f.UploaderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Appointment)
            .WithMany(a => a.Attachments)
            .HasForeignKey(f => f.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
