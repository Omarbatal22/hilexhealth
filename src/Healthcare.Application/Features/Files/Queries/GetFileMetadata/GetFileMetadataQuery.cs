using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Files.Queries.GetFileMetadata;

public record GetFileMetadataQuery(Guid Id) : IRequest<FileMetadataDto>;

public class GetFileMetadataQueryHandler : IRequestHandler<GetFileMetadataQuery, FileMetadataDto>
{
    private readonly IApplicationDbContext _context;

    public GetFileMetadataQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FileMetadataDto> Handle(GetFileMetadataQuery request, CancellationToken cancellationToken)
    {
        var file = await _context.FileMetadata
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (file == null)
        {
            throw new NotFoundException(nameof(FileMetadata), request.Id);
        }

        return new FileMetadataDto
        {
            Id = file.Id,
            UploaderId = file.UploaderId,
            AppointmentId = file.AppointmentId,
            FileName = file.FileName,
            StoragePath = file.StoragePath,
            ContentType = file.ContentType,
            FileSizeInBytes = file.FileSizeInBytes,
            AccessLevel = file.AccessLevel,
            CreatedAt = file.CreatedAt
        };
    }
}
