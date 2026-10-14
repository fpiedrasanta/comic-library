namespace Application.Constants;

public static class WorkCatalogSortFields
{
    public const string Title = "Title";
    public const string PublicationDate = "PublicationDate";
    public const string CreatedAt = "CreatedAt";

    /// <summary>
    /// Public catalog alias for <see cref="CreatedAt"/> (Work.CreatedAt is the upload timestamp).
    /// </summary>
    public const string UploadedAt = "UploadedAt";

    public const string Number = "Number";
}
