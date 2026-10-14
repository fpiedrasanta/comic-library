namespace Application.DTOs;

public record AuthResult(AuthResponse AuthResponse, string RefreshTokenRaw);