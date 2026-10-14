using Microsoft.AspNetCore.Http;

namespace Api.Helpers;

public static class FormFileReader
{
    public static async Task<byte[]> ReadAsync(IFormFile? file, CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return Array.Empty<byte>();
        }

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);
        return stream.ToArray();
    }
}
