namespace Application.Exceptions;

public class AIProviderException : Exception
{
    public string ProviderName { get; }
    public int? StatusCode { get; }
    public string? ResponseBody { get; }

    public AIProviderException(string providerName, string message, Exception? innerException = null, int? statusCode = null, string? responseBody = null)
        : base(message, innerException)
    {
        ProviderName = providerName;
        StatusCode = statusCode;
        ResponseBody = responseBody;
    }
}