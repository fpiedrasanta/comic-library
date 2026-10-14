namespace Application.DTOs;

public record CreatePublisherRequest(string Name, string? Description, string? Website, long? CountryId, int? FoundedYear, string? History, bool IsAlive, byte[]? AvatarData, string? AvatarFileName, string? Color, bool IsFeatured);
