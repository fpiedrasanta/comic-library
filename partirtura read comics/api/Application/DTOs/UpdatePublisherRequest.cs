namespace Application.DTOs;

public record UpdatePublisherRequest(string Name, string? Description, string? Website, long? CountryId, int? FoundedYear, string? History, bool IsAlive, long? ImageId, byte[]? AvatarData, string? AvatarFileName, string? Color, bool IsFeatured);
