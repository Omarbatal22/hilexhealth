using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Patient> Patients { get; }
    DbSet<Doctor> Doctors { get; }
    DbSet<Appointment> Appointments { get; }
    DbSet<Symptom> Symptoms { get; }
    DbSet<Message> Messages { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<FileMetadata> FileMetadata { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    
    DbSet<TrainingDataset> TrainingDatasets { get; }
    DbSet<ModelVersion> ModelVersions { get; }
    DbSet<ModelPerformanceMetric> ModelPerformanceMetrics { get; }
    DbSet<TriageAssessment> TriageAssessments { get; }
    DbSet<TriagePrediction> TriagePredictions { get; }
    DbSet<AiPredictionLog> AiPredictionLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    Task<bool> CanConnectAsync(CancellationToken cancellationToken);
}
