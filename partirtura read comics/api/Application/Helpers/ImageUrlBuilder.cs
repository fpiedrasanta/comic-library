using Domain.Entities;

namespace Application.Helpers;

public static class ImageUrlBuilder
{
    public static string? ToUrl(Image? image)
    {
        return image is null ? null : $"/images/{image.Id}";
    }
}
