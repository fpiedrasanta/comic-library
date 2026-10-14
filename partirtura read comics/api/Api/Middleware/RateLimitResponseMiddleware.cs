using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace Api.Middleware;

public class RateLimitResponseMiddleware(RequestDelegate next, ILogger<RateLimitResponseMiddleware> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<RateLimitResponseMiddleware> _logger = logger;

    public async Task Invoke(HttpContext context)
    {
        await _next(context);

        if (context.Response.StatusCode == StatusCodes.Status429TooManyRequests)
        {
            context.Response.ContentType = "application/json";

            var retryAfter = context.Response.Headers.RetryAfter.ToString();
            var message = string.IsNullOrWhiteSpace(retryAfter)
                ? "Hemos detectado un tráfico inusual desde tu cuenta. Deberás esperar unos minutos para que se reestablezca."
                : $"Hemos detectado un tráfico inusual desde tu cuenta. Deberás esperar {retryAfter} segundos para que se reestablezca.";

            var response = new
            {
                success = false,
                message = message,
                code = StatusCodes.Status429TooManyRequests,
                payload = new { detail = message }
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}