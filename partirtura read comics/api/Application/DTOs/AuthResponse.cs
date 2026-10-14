namespace Application.DTOs;

public record AuthResponse(string AccessToken, long UserId, string Email, string FullName, string Role, string? AvatarUrl);