namespace Application.DTOs;

public record AIImagePart(
    string MimeType,
    byte[] Data);

public record AIRequest(
    string Prompt,
    IReadOnlyList<AIImagePart>? Images = null,
    string? StructuredOutputSchema = null);

public record AIResponse(
    string Content,
    string Provider,
    string Model);
