using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Healthcare.Domain.Common;
using Healthcare.Domain.Entities;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Persistence;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Symptom> Symptoms => Set<Symptom>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<FileMetadata> FileMetadata => Set<FileMetadata>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<TrainingDataset> TrainingDatasets => Set<TrainingDataset>();
    public DbSet<ModelVersion> ModelVersions => Set<ModelVersion>();
    public DbSet<ModelPerformanceMetric> ModelPerformanceMetrics => Set<ModelPerformanceMetric>();
    public DbSet<TriageAssessment> TriageAssessments => Set<TriageAssessment>();
    public DbSet<TriagePrediction> TriagePredictions => Set<TriagePrediction>();
    public DbSet<AiPredictionLog> AiPredictionLogs => Set<AiPredictionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Ignore<DomainEvent>();

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Apply global Soft Delete filter for all entities implementing ISoftDelete
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
                var falseConstant = Expression.Constant(false);
                var compare = Expression.Equal(property, falseConstant);
                var lambda = Expression.Lambda(compare, parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

        // Avoid EF Core warnings about required relationships with global query filters
        modelBuilder.Entity<Message>().HasQueryFilter(m => !m.Appointment.IsDeleted);
        modelBuilder.Entity<ModelPerformanceMetric>().HasQueryFilter(m => !m.ModelVersion.IsDeleted);
        modelBuilder.Entity<Notification>().HasQueryFilter(n => !n.User.IsDeleted);
        modelBuilder.Entity<RefreshToken>().HasQueryFilter(t => !t.User.IsDeleted);
        modelBuilder.Entity<TriagePrediction>().HasQueryFilter(p => !p.ModelVersion.IsDeleted);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> CanConnectAsync(CancellationToken cancellationToken)
    {
        return await Database.CanConnectAsync(cancellationToken);
    }
}
