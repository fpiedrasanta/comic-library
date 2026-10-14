namespace Api.DTOs;

public record ApiResponse<T>(
    bool Success,
    string Message,
    int Code,
    T? Payload);
