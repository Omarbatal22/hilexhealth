using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Files.Commands.DeleteFile;

public record DeleteFileCommand : IRequest
{
    public Guid Id { get; init; }
    public Guid RequesterId { get; init; }
}

public class DeleteFileCommandValidator : AbstractValidator<DeleteFileCommand>
{
    public DeleteFileCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.RequesterId).NotEmpty();
    }
}

public class DeleteFileCommandHandler : IRequestHandler<DeleteFileCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public DeleteFileCommandHandler(IApplicationDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task Handle(DeleteFileCommand request, CancellationToken cancellationToken)
    {
        var file = await _context.FileMetadata
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (file == null)
        {
            throw new NotFoundException(nameof(FileMetadata), request.Id);
        }

        // Verify that the requester is the owner/uploader
        if (file.UploaderId != request.RequesterId)
        {
            throw new Healthcare.Application.Common.Exceptions.ForbiddenAccessException();
        }

        // Delete from physical storage
        await _fileStorageService.DeleteFileAsync(file.StoragePath, cancellationToken);

        // Remove from db (Soft delete interceptor will flag as deleted)
        _context.FileMetadata.Remove(file);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
