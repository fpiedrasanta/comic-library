namespace Application.Constants;

public static class RateLimitPolicies
{
    public const string AuthRegister = "rl-auth-register";
    public const string AuthLogin = "rl-auth-login";
    public const string AuthGoogleLogin = "rl-auth-google-login";
    public const string AuthRefresh = "rl-auth-refresh";
    public const string AuthForgotPassword = "rl-auth-forgot-password";
    public const string AuthResendCode = "rl-auth-resend-code";
    public const string AuthAccountDeletion = "rl-auth-account-deletion";
    public const string AdminAiAnalysis = "rl-admin-ai-analysis";
    public const string AdminListTypeCreate = "rl-admin-list-type-create";
    public const string AdminWorkListCreate = "rl-admin-work-list-create";
    public const string AdminWorkCreate = "rl-admin-work-create";
}
