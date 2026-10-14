namespace Domain.Exceptions;

public class RateLimitExceededException : BusinessException
{
    public RateLimitExceededException(string message) : base(message) { }
}
