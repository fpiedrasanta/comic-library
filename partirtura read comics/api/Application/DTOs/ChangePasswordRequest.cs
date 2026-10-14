namespace Application.DTOs;

public record ChangePasswordRequest(string Email, string AuthorizationToken, string NewPassword);