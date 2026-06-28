using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Files.Commands.UploadFile;

public record UploadFileCommand : IRequest<Guid>
{
    public Guid UploaderId { get; init; }
    public Guid? AppointmentId { get; init; }
    public string FileName { get; init; } = null!;
    public Stream ContentStream { get; init; } = null!;
    public string ContentType { get; init; } = null!;
    public long FileSizeInBytes { get; init; }
    public string AccessLevel { get; init; } = "Private";
}

public class UploadFileCommandValidator : AbstractValidator<UploadFileCommand>
{
    public UploadFileCommandValidator()
    {
        RuleFor(x => x.UploaderId).NotEmpty();
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.ContentStream).NotNull();
        RuleFor(x => x.ContentType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FileSizeInBytes).GreaterThan(0);
        RuleFor(x => x.AccessLevel).Must(x => x == "Private" || x == "SharedWithDoctor" || x == "Public")
            .WithMessage("AccessLevel must be Private, SharedWithDoctor, or Public.");
    }
}

public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public UploadFileCommandHandler(IApplicationDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<Guid> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        // 1. Enforce max file size: 5MB
        const long MaxFileSize = 5 * 1024 * 1024;
        if (request.FileSizeInBytes > MaxFileSize)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
            {
                new ValidationError("FileSizeInBytes", "File size exceeds the 5MB limit.")
            });
        }

        // 2. Restrict allowed extensions
        var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".jpeg" };
        if (Array.IndexOf(allowedExtensions, extension) < 0)
        {
            throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
            {
                new ValidationError("FileName", "Only PDF, PNG, JPG, and JPEG files are allowed.")
            });
        }

        // 3. Verify magic numbers (MIME type verification against actual headers)
        if (request.ContentStream.CanSeek)
        {
            var headerBytes = new byte[4];
            var read = await request.ContentStream.ReadAsync(headerBytes, 0, 4, cancellationToken);
            request.ContentStream.Seek(0, SeekOrigin.Begin); // Reset position

            if (read >= 3)
            {
                bool isValid = false;
                if (extension == ".pdf" && headerBytes[0] == 0x25 && headerBytes[1] == 0x50 && headerBytes[2] == 0x44 && headerBytes[3] == 0x46)
                {
                    isValid = true; // %PDF
                }
                else if (extension == ".png" && headerBytes[0] == 0x89 && headerBytes[1] == 0x50 && headerBytes[2] == 0x4E && headerBytes[3] == 0x47)
                {
                    isValid = true; // PNG
                }
                else if ((extension == ".jpg" || extension == ".jpeg") && headerBytes[0] == 0xFF && headerBytes[1] == 0xD8 && headerBytes[2] == 0xFF)
                {
                    isValid = true; // JPEG
                }

                if (!isValid)
                {
                    throw new Healthcare.Application.Common.Exceptions.ValidationException(new[]
                    {
                        new ValidationError("ContentStream", "File header signatures do not match the expected extension.")
                    });
                }
            }
        }

        var uploaderExists = await _context.Users.AnyAsync(u => u.Id == request.UploaderId, cancellationToken);
        if (!uploaderExists)
        {
            throw new NotFoundException(nameof(User), request.UploaderId);
        }

        if (request.AppointmentId.HasValue)
        {
            var appointmentExists = await _context.Appointments.AnyAsync(a => a.Id == request.AppointmentId.Value, cancellationToken);
            if (!appointmentExists)
            {
                throw new NotFoundException(nameof(Appointment), request.AppointmentId.Value);
            }
        }

        // 4. Generate unique GUID for storage file name to prevent collision/overwriting
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";

        // Upload to storage service using the unique storage filename
        var storagePath = await _fileStorageService.UploadFileAsync(uniqueFileName, request.ContentStream, cancellationToken);

        var fileMetadata = new FileMetadata
        {
            UploaderId = request.UploaderId,
            AppointmentId = request.AppointmentId,
            FileName = request.FileName,
            StoragePath = storagePath,
            ContentType = request.ContentType,
            FileSizeInBytes = request.FileSizeInBytes,
            AccessLevel = request.AccessLevel
        };

        _context.FileMetadata.Add(fileMetadata);
        await _context.SaveChangesAsync(cancellationToken);

        return fileMetadata.Id;
    }
}
