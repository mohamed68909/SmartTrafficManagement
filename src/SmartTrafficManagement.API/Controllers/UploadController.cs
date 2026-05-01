using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.API.Controllers;

/// <summary>
/// General-purpose file upload endpoint.
/// Returns a publicly accessible URL for the uploaded file.
/// </summary>
[Route("api/upload")]
[Authorize]
public sealed class UploadController : BaseController
{
    private readonly IFileStorageService _storage;

    public UploadController(IFileStorageService storage)
        => _storage = storage;

    /// <summary>
    /// Upload a single file (image / PDF / document).
    /// Images are automatically compressed and converted to WebP for optimal size.
    /// </summary>
    /// <remarks>
    /// Content-Type: multipart/form-data.
    /// Allowed types: jpg, jpeg, png, gif, webp, pdf.
    /// Max raw size: 15 MB (images will be compressed after upload).
    ///
    /// **folder** query param controls compression profile:
    /// - `avatars`   → max 400px wide, quality 80  (profile pictures)
    /// - `products`  → max 800px wide, quality 72  (store product images)
    /// - `documents` → max 1600px wide, quality 85 (ID / license scans)
    /// - `misc`      → max 1200px wide, quality 75 (default)
    ///
    /// All images are converted to WebP (~30% smaller than JPEG at same quality).
    /// EXIF metadata is stripped automatically.
    ///
    /// Flutter example:
    ///   var req = http.MultipartRequest('POST', Uri.parse('/api/upload?folder=products'));
    ///   req.files.add(await http.MultipartFile.fromPath('file', imagePath));
    /// </remarks>
    [HttpPost]
    [AllowAnonymous]
    [RequestSizeLimit(15 * 1024 * 1024)]   // 15 MB raw — service compresses after upload
    [ProducesResponseType(typeof(Result<UploadResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<UploadResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Upload(
        IFormFile file,
        [FromQuery] string folder = "misc",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
            return ProcessResult(Result<UploadResponseDto>.Failure(
                DomainErrors.Common.Validation("No file was provided."), 400));

        // Sanitise the folder name — only allow alphanumeric + hyphen/underscore
        if (!System.Text.RegularExpressions.Regex.IsMatch(folder, @"^[a-zA-Z0-9_\-]+$"))
            folder = "misc";

        try
        {
            await using var stream = file.OpenReadStream();
            var url = await _storage.SaveAsync(stream, file.FileName, folder, cancellationToken);

            return ProcessResult(Result<UploadResponseDto>.Success(new UploadResponseDto
            {
                Url      = url,
                FileName = file.FileName,
                SizeKb   = (int)(file.Length / 1024),
                Folder   = folder
            }, 200));
        }
        catch (InvalidOperationException ex)
        {
            return ProcessResult(Result<UploadResponseDto>.Failure(
                DomainErrors.Common.Validation(ex.Message), 400));
        }
    }

    /// <summary>
    /// Upload multiple files at once (max 5).
    /// </summary>
    [HttpPost("multiple")]
    [AllowAnonymous]
    [RequestSizeLimit(50 * 1024 * 1024)]   // 5 files × 15 MB each at most
    [ProducesResponseType(typeof(Result<IReadOnlyList<UploadResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<IReadOnlyList<UploadResponseDto>>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UploadMultiple(
        List<IFormFile> files,
        [FromQuery] string folder = "documents",
        CancellationToken cancellationToken = default)
    {
        if (files is null || files.Count == 0)
            return ProcessResult(Result<IReadOnlyList<UploadResponseDto>>.Failure(
                DomainErrors.Common.Validation("No files were provided."), 400));

        if (files.Count > 5)
            return ProcessResult(Result<IReadOnlyList<UploadResponseDto>>.Failure(
                DomainErrors.Common.Validation("Maximum 5 files allowed per request."), 400));

        if (!System.Text.RegularExpressions.Regex.IsMatch(folder, @"^[a-zA-Z0-9_\-]+$"))
            folder = "documents";

        var results = new List<UploadResponseDto>();

        try
        {
            foreach (var file in files)
            {
                if (file.Length == 0) continue;
                await using var stream = file.OpenReadStream();
                var url = await _storage.SaveAsync(stream, file.FileName, folder, cancellationToken);

                results.Add(new UploadResponseDto
                {
                    Url      = url,
                    FileName = file.FileName,
                    SizeKb   = (int)(file.Length / 1024),
                    Folder   = folder
                });
            }

            return ProcessResult(Result<IReadOnlyList<UploadResponseDto>>.Success(results, 200));
        }
        catch (InvalidOperationException ex)
        {
            return ProcessResult(Result<IReadOnlyList<UploadResponseDto>>.Failure(
                DomainErrors.Common.Validation(ex.Message), 400));
        }
    }
}

public sealed class UploadResponseDto
{
    public string Url      { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public int    SizeKb   { get; set; }
    public string Folder   { get; set; } = string.Empty;
}
