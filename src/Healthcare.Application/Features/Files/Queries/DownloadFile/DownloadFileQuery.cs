using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Files.Queries.DownloadFile;

public record DownloadFileResult(Stream Stream, string FileName, string ContentType);

public record DownloadFileQuery(Guid Id) : IRequest<DownloadFileResult>;

public class DownloadFileQueryHandler : IRequestHandler<DownloadFileQuery, DownloadFileResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;

    public DownloadFileQueryHandler(
        IApplicationDbContext context, 
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
    }

    public async Task<DownloadFileResult> Handle(DownloadFileQuery request, CancellationToken cancellationToken)
    {
        var file = await _context.FileMetadata
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (file == null)
        {
            throw new NotFoundException(nameof(FileMetadata), request.Id);
        }

        // 1. Authorization checks on download
        var requesterId = _currentUserService.UserId;
        if (requesterId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var isAdmin = _currentUserService.Roles.Contains("Administrator");
        var isDoctor = _currentUserService.Roles.Contains("Doctor");

        if (!isAdmin && file.UploaderId != requesterId)
        {
            if (file.AccessLevel == "Private")
            {
                if (file.AppointmentId.HasValue)
                {
                    // Check if patient or doctor of the appointment
                    var appointment = await _context.Appointments
                        .Include(a => a.Patient)
                        .Include(a => a.Doctor)
                        .FirstOrDefaultAsync(a => a.Id == file.AppointmentId.Value, cancellationToken);

                    if (appointment == null || 
                        (appointment.Patient.UserId != requesterId && appointment.Doctor.UserId != requesterId))
                    {
                        throw new ForbiddenAccessException();
                    }
                }
                else
                {
                    throw new ForbiddenAccessException();
                }
            }
            else if (file.AccessLevel == "Internal")
            {
                // Internal files are for medical staff (Doctors) only
                if (!isDoctor)
                {
                    throw new ForbiddenAccessException();
                }
            }
        }

        // 2. Audit logging for download
        var auditLog = new AuditLog
        {
            UserId = requesterId,
            Action = "Download",
            EntityName = nameof(FileMetadata),
            EntityId = file.Id,
            Timestamp = DateTime.UtcNow,
            IpAddress = _currentUserService.IpAddress,
            UserAgent = _currentUserService.UserAgent,
            CorrelationId = _currentUserService.CorrelationId
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);

        var stream = await _fileStorageService.DownloadFileAsync(file.StoragePath, cancellationToken);

        return new DownloadFileResult(stream, file.FileName, file.ContentType);
    }
}
