using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Healthcare.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(string fileName, Stream stream, CancellationToken cancellationToken = default);
    Task<Stream> DownloadFileAsync(string storagePath, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string storagePath, CancellationToken cancellationToken = default);
}
