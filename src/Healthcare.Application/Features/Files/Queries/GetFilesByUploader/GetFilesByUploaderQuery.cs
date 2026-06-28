using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Files.Queries.GetFilesByUploader;

public record GetFilesByUploaderQuery(Guid UploaderId) : IRequest<IReadOnlyList<FileMetadataDto>>;

public class GetFilesByUploaderQueryHandler : IRequestHandler<GetFilesByUploaderQuery, IReadOnlyList<FileMetadataDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFilesByUploaderQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FileMetadataDto>> Handle(GetFilesByUploaderQuery request, CancellationToken cancellationToken)
    {
        var files = await _context.FileMetadata
            .AsNoTracking()
            .Where(f => f.UploaderId == request.UploaderId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FileMetadataDto
            {
                Id = f.Id,
                UploaderId = f.UploaderId,
                AppointmentId = f.AppointmentId,
                FileName = f.FileName,
                StoragePath = f.StoragePath,
                ContentType = f.ContentType,
                FileSizeInBytes = f.FileSizeInBytes,
                AccessLevel = f.AccessLevel,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return files;
    }
}
