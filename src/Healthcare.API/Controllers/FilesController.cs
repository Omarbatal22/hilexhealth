using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Healthcare.Application.Features.Files.Commands.UploadFile;
using Healthcare.Application.Features.Files.Commands.DeleteFile;
using Healthcare.Application.Features.Files.Queries.GetFileMetadata;
using Healthcare.Application.Features.Files.Queries.DownloadFile;
using Healthcare.Application.Features.Files.Queries.GetFilesByUploader;
using Healthcare.Application.Features.Files.Queries;

namespace Healthcare.API.Controllers;

[Authorize]
public class FilesController : ApiControllerBase
{
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<Guid>> Upload(
        [FromForm] Guid? uploaderId,
        [FromForm] Guid? appointmentId,
        [FromForm] string? accessLevel,
        IFormFile file)
    {
        var finalUploaderId = uploaderId;
        if (!finalUploaderId.HasValue || finalUploaderId == Guid.Empty)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
            {
                finalUploaderId = parsedId;
            }
        }

        if (!finalUploaderId.HasValue || finalUploaderId == Guid.Empty)
        {
            return BadRequest("Uploader ID is required.");
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("File is empty.");
        }

        using var stream = file.OpenReadStream();
        var command = new UploadFileCommand
        {
            UploaderId = finalUploaderId.Value,
            AppointmentId = appointmentId,
            FileName = file.FileName,
            ContentStream = stream,
            ContentType = file.ContentType,
            FileSizeInBytes = file.Length,
            AccessLevel = accessLevel ?? "Private"
        };

        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}/metadata")]
    public async Task<ActionResult<FileMetadataDto>> GetMetadata(Guid id)
    {
        var result = await Mediator.Send(new GetFileMetadataQuery(id));
        return Ok(result);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var result = await Mediator.Send(new DownloadFileQuery(id));
        return File(result.Stream, result.ContentType, result.FileName);
    }

    [HttpGet("uploader/{uploaderId}")]
    [HttpGet("/api/v1/patients/{patientId}/files")]
    public async Task<ActionResult<IReadOnlyList<FileMetadataDto>>> GetFilesByUploader(Guid uploaderId, Guid? patientId)
    {
        var targetId = patientId ?? uploaderId;
        var result = await Mediator.Send(new GetFilesByUploaderQuery(targetId));
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var requesterId))
        {
            return Unauthorized();
        }

        await Mediator.Send(new DeleteFileCommand { Id = id, RequesterId = requesterId });
        return NoContent();
    }
}
