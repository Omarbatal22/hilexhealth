using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Healthcare.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Healthcare.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(ILogger<FileStorageService> _logger)
    {
        this._logger = _logger;
    }

    public Task<string> UploadFileAsync(string fileName, Stream stream, CancellationToken cancellationToken = default)
    {
        var virtualPath = $"/uploads/{fileName}";
        _logger.LogInformation("Simulated Upload of {File} to virtual storage path: {Path}", fileName, virtualPath);
        return Task.FromResult(virtualPath);
    }

    public Task<Stream> DownloadFileAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulated Download from storage path: {Path}", storagePath);
        return Task.FromResult<Stream>(new MemoryStream());
    }

    public Task DeleteFileAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulated Deletion from storage path: {Path}", storagePath);
        return Task.CompletedTask;
    }
}
