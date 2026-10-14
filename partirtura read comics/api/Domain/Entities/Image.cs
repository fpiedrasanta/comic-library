using Domain.Enums;

namespace Domain.Entities;

public class Image : File
{
    public int? Width { get; set; }
    public int? Height { get; set; }
    public ImageType Type { get; set; }
}
