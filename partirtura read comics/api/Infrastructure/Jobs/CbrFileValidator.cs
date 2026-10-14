namespace Infrastructure.Jobs;

internal static class CbrFileValidator
{
    public const string TempRootRelative = "Storage/Temp";

    public static bool IsPathWithinTempRoot(string? path, string contentRootPath)
    {
        if (string.IsNullOrWhiteSpace(path) || string.IsNullOrWhiteSpace(contentRootPath))
        {
            return false;
        }

        var tempRoot = Path.GetFullPath(Path.Combine(contentRootPath, TempRootRelative));
        var fullPath = Path.GetFullPath(path);

        var comparison = OperatingSystem.IsWindows() || OperatingSystem.IsLinux() || OperatingSystem.IsMacOS()
            ? StringComparison.OrdinalIgnoreCase
            : StringComparison.Ordinal;

        return fullPath.StartsWith(tempRoot + Path.DirectorySeparatorChar, comparison)
            || string.Equals(fullPath, tempRoot, comparison);
    }

    public static bool IsImageFile(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return false;
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext is ".jpg" or ".jpeg" or ".png" or ".gif" or ".bmp" or ".webp" or ".tiff";
    }
}
