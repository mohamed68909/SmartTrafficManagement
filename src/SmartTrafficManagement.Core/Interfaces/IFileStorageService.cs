namespace SmartTrafficManagement.Core.Interfaces;

/// <summary>
/// Handles file uploads and returns a publicly accessible URL.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Saves a file and returns its public URL.
    /// </summary>
    /// <param name="fileStream">The file content stream.</param>
    /// <param name="fileName">Original file name (used to preserve extension).</param>
    /// <param name="folder">Optional sub-folder inside uploads (e.g. "documents", "avatars").</param>
    Task<string> SaveAsync(Stream fileStream, string fileName, string folder = "misc", CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a previously uploaded file by its relative path or full URL.
    /// </summary>
    Task DeleteAsync(string fileUrlOrPath, CancellationToken cancellationToken = default);
}
