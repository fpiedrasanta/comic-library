using System.Threading.RateLimiting;
using Application.Constants;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Middleware;

public static class RateLimiterConfiguration
{
    public const string IpPartitionKey = "ip";

    public static IServiceCollection AddComicLibraryRateLimiter(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy(RateLimitPolicies.AuthRegister, BuildFixedWindowByIp(
                permitLimit: 5, windowSeconds: 3600, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AuthLogin, BuildFixedWindowByIp(
                permitLimit: 10, windowSeconds: 900, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AuthGoogleLogin, BuildFixedWindowByIp(
                permitLimit: 10, windowSeconds: 900, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AuthRefresh, BuildFixedWindowByIp(
                permitLimit: 30, windowSeconds: 60, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AuthForgotPassword, BuildFixedWindowByIp(
                permitLimit: 5, windowSeconds: 3600, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AuthResendCode, BuildFixedWindowByIp(
                permitLimit: 3, windowSeconds: 3600, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AuthAccountDeletion, BuildFixedWindowByUser(
                permitLimit: 5, windowSeconds: 3600, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AdminAiAnalysis, BuildFixedWindowByUser(
                permitLimit: 10, windowSeconds: 300, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AdminListTypeCreate, BuildFixedWindowByUser(
                permitLimit: 10, windowSeconds: 300, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AdminWorkListCreate, BuildFixedWindowByUser(
                permitLimit: 10, windowSeconds: 300, queueLimit: 0));

            options.AddPolicy(RateLimitPolicies.AdminWorkCreate, BuildFixedWindowByUser(
                permitLimit: 10, windowSeconds: 300, queueLimit: 0));
        });

        return services;
    }

    private static Func<HttpContext, RateLimitPartition<string>> BuildFixedWindowByIp(int permitLimit, int windowSeconds, int queueLimit) =>
        context =>
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: $"{IpPartitionKey}:{ip}",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = permitLimit,
                    Window = TimeSpan.FromSeconds(windowSeconds),
                    QueueLimit = queueLimit,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                });
        };

    private static Func<HttpContext, RateLimitPartition<string>> BuildFixedWindowByUser(int permitLimit, int windowSeconds, int queueLimit) =>
        context =>
        {
            var userId = context.User?.FindFirst("sub")?.Value
                ?? context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? context.Connection.RemoteIpAddress?.ToString()
                ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: $"user:{userId}",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = permitLimit,
                    Window = TimeSpan.FromSeconds(windowSeconds),
                    QueueLimit = queueLimit,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                });
        };
}
