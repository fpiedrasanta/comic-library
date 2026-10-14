using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using ImageMagick;
using Microsoft.AspNetCore.Hosting;

namespace Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly string _storagePath;
    private readonly string _relativeStoragePath;

    public FileStorageService(IWebHostEnvironment env)
    {
        _env = env;
        _relativeStoragePath = Path.Combine("Storage", "Images");
        _storagePath = Path.Combine(_env.ContentRootPath, _relativeStoragePath);
    }

    public async Task<Image> SaveAsync(byte[] data, string fileName, ImageType type, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(_storagePath);

        var extension = Path.GetExtension(fileName);
        var finalFileName = $"{Guid.NewGuid()}{extension}";
        var physicalPath = Path.Combine(_storagePath, finalFileName);
        var relativeStoragePath = Path.Combine(_relativeStoragePath, finalFileName);

        int? width = null;
        int? height = null;

        using var image = new MagickImage(data);

        if (type == ImageType.Avatar)
        {
            const int maxSize = 256;
            var ratio = (double)maxSize / Math.Max(image.Width, image.Height);
            var newWidth = (uint)(image.Width * ratio);
            var newHeight = (uint)(image.Height * ratio);

            image.Resize(newWidth, newHeight);
            width = (int)newWidth;
            height = (int)newHeight;

        }

        image.Format = MagickFormat.WebP;
        image.Write(physicalPath);

        var size = new FileInfo(physicalPath).Length;

        return new Image
        {
            FileName = finalFileName,
            ContentType = "image/webp",
            Size = size,
            StoragePath = relativeStoragePath,
            Width = width,
            Height = height,
            Type = type
        };
    }

    public async Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            return;
        }

        var physicalPath = GetPhysicalPath(storagePath);

        if (global::System.IO.File.Exists(physicalPath))
        {
            await Task.Run(() => global::System.IO.File.Delete(physicalPath), cancellationToken);
        }
    }

    public async Task<string> SaveFileAsync(byte[] data, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        var folderPath = Path.Combine(_env.ContentRootPath, folder);
        Directory.CreateDirectory(folderPath);

        var finalFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var physicalPath = Path.Combine(folderPath, finalFileName);
        var relativePath = Path.Combine(folder, finalFileName);

        await System.IO.File.WriteAllBytesAsync(physicalPath, data, cancellationToken);

        return relativePath;
    }

    public string GetPhysicalPath(string storagePath)
    {
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            return string.Empty;
        }

        if (Path.IsPathRooted(storagePath))
        {
            return storagePath;
        }

        return Path.Combine(_env.ContentRootPath, storagePath);
    }
}
