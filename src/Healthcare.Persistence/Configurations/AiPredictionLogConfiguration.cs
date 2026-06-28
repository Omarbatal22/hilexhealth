using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence.Configurations;

public class AiPredictionLogConfiguration : IEntityTypeConfiguration<AiPredictionLog>
{
    public void Configure(EntityTypeBuilder<AiPredictionLog> builder)
    {
        builder.ToTable("ai_prediction_logs");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.CorrelationId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(l => l.ModelVersionName)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(l => l.UserId);
        builder.HasIndex(l => l.CorrelationId);
        builder.HasIndex(l => l.Timestamp);
    }
}
