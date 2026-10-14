namespace Application.DTOs;

public record ValidateEmailResponse(string Token, UserInfoDto User, string Role);
