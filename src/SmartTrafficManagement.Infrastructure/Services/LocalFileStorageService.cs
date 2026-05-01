using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Infrastructure.Services;

/// <summary>
/// Saves uploaded files to wwwroot/uploads/{folder}/ and returns a publicly accessible URL.
/// Images are automatically compressed and resized based on the target folder.
/// Swap this implementation for a CDN-backed service (Cloudinary / S3) when scaling.
/// </summary>
public sealed class LocalFileStorageService : IFileStorageService
{
    // ── Allowed file types ────────────────────────────────────────────────────
    private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif"
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",   // images
        ".pdf"                                        // documents only — no video to keep storage small
    };

    private const long MaxRawFileSizeBytes = 15 * 1024 * 1024; // 15 MB raw input allowed

    // ── Per-folder compression profiles ──────────────────────────────────────
    /// <summary>
    /// Different folders have different size / quality trade-offs.
    /// products  → medium quality, max 800px wide  (fast listing load)
    /// avatars   → high quality,  max 400px wide  (profile pictures)
    /// documents → no resize (PDFs pass through, images kept as-is)
    /// misc      → medium quality, max 1200px wide
    /// </summary>
    private static readonly Dictionary<string, ImageProfile> FolderProfiles = new(StringComparer.OrdinalIgnoreCase)
    {
        ["products"]  = new(MaxWidth: 800,  Quality: 72),
        ["avatars"]   = new(MaxWidth: 400,  Quality: 80),
        ["documents"] = new(MaxWidth: 1600, Quality: 85),  // only applied if image
        ["misc"]      = new(MaxWidth: 1200, Quality: 75),
    };

    private static readonly ImageProfile DefaultProfile = new(MaxWidth: 1200, Quality: 75);

    // ── Dependencies ──────────────────────────────────────────────────────────
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IWebHostEnvironment env,
        IHttpContextAccessor httpContextAccessor,
        ILogger<LocalFileStorageService> logger)
    {
        _env                 = env;
        _httpContextAccessor = httpContextAccessor;
        _logger              = logger;
    }

    // ── SaveAsync ─────────────────────────────────────────────────────────────
    public async Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string folder              = "misc",
        CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException($"File type '{ext}' is not allowed. Allowed: jpg, jpeg, png, webp, gif, pdf.");

        // Buffer entire stream (handles non-seekable IFormFile streams)
        using var rawBuffer = new MemoryStream();
        await fileStream.CopyToAsync(rawBuffer, cancellationToken);

        if (rawBuffer.Length > MaxRawFileSizeBytes)
            throw new InvalidOperationException($"File exceeds the {MaxRawFileSizeBytes / 1024 / 1024} MB size limit.");

        // Resolve the compression profile for this folder
        var profile = FolderProfiles.GetValueOrDefault(folder, DefaultProfile);

        // Process the buffer — compress images, pass PDFs through
        rawBuffer.Position = 0;
        var (processedBytes, savedExt) = ImageExtensions.Contains(ext)
            ? await CompressImageAsync(rawBuffer, ext, profile, cancellationToken)
            : (rawBuffer.ToArray(), ext);   // PDF → no processing

        // Build physical path
        var uploadsRoot = Path.Combine(
            _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
            "uploads", folder);
        Directory.CreateDirectory(uploadsRoot);

        var uniqueName   = $"{Guid.NewGuid()}{savedExt}";
        var physicalPath = Path.Combine(uploadsRoot, uniqueName);

        await File.WriteAllBytesAsync(physicalPath, processedBytes, cancellationToken);

        _logger.LogInformation(
            "File saved: {Path} | original {OrigKb} KB → compressed {CompKb} KB",
            physicalPath, rawBuffer.Length / 1024, processedBytes.Length / 1024);

        return BuildUrl(folder, uniqueName);
    }

    // ── DeleteAsync ───────────────────────────────────────────────────────────
    public Task DeleteAsync(string fileUrlOrPath, CancellationToken cancellationToken = default)
    {
        try
        {
            string relativePath = fileUrlOrPath.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? new Uri(fileUrlOrPath).AbsolutePath
                : fileUrlOrPath;

            var subPath      = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var wwwRoot      = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var physicalPath = Path.Combine(wwwRoot, subPath);

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                _logger.LogInformation("File deleted: {Path}", physicalPath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete file: {File}", fileUrlOrPath);
        }

        return Task.CompletedTask;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Loads the image, resizes if wider than MaxWidth, saves as WebP (best compression/quality ratio).
    /// Falls back to JPEG if something fails.
    /// </summary>
    private static async Task<(byte[] bytes, string ext)> CompressImageAsync(
        Stream input,
        string originalExt,
        ImageProfile profile,
        CancellationToken cancellationToken)
    {
        try
        {
            using var image = await Image.LoadAsync(input, cancellationToken);

            // Resize only if wider than the limit (preserve aspect ratio)
            if (image.Width > profile.MaxWidth)
            {
                image.Mutate(ctx => ctx.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(profile.MaxWidth, 0)
                }));
            }

            // Strip EXIF metadata (privacy + size reduction)
            image.Metadata.ExifProfile = null;

            // Save as WebP for best compression — ~30% smaller than JPEG at same quality
            using var output = new MemoryStream();
            var encoder = new WebpEncoder
            {
                Quality      = profile.Quality,
                FileFormat   = WebpFileFormatType.Lossy,
                Method       = WebpEncodingMethod.Default
            };
            await image.SaveAsync(output, encoder, cancellationToken);
            return (output.ToArray(), ".webp");
        }
        catch (Exception)
        {
            // Fallback: save as JPEG if WebP encoding fails
            input.Position = 0;
            using var image = await Image.LoadAsync(input, cancellationToken);

            if (image.Width > profile.MaxWidth)
                image.Mutate(ctx => ctx.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(profile.MaxWidth, 0)
                }));

            image.Metadata.ExifProfile = null;

            using var output = new MemoryStream();
            await image.SaveAsync(output, new JpegEncoder { Quality = profile.Quality }, cancellationToken);
            return (output.ToArray(), ".jpg");
        }
    }

    private string BuildUrl(string folder, string fileName)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request is null)
            return $"/uploads/{folder}/{fileName}";

        return $"{request.Scheme}://{request.Host}/uploads/{folder}/{fileName}";
    }

    // ── Inner record ─────────────────────────────────────────────────────────
    private sealed record ImageProfile(int MaxWidth, int Quality);
}
