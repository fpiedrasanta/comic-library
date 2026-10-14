namespace Api.DTOs;

public record ApiError(
    string Field,
    string Message);
