using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(l => l.EntityName)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasOne(l => l.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(l => l.Timestamp);
    }
}
