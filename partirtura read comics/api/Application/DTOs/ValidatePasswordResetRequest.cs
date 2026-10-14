namespace Application.DTOs;

public record ValidatePasswordResetRequest(string Email, string Code);