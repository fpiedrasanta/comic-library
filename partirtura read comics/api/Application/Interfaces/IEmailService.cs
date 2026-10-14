namespace Application.Interfaces;

public interface IEmailService
{
    Task SendEmailValidationAsync(string email, string token, int expiresInMinutes, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string email, string code, int expiresInMinutes, CancellationToken cancellationToken = default);
    Task SendAccountDeletionCodeAsync(string email, string code, int expiresInMinutes, CancellationToken cancellationToken = default);
    Task SendEmailAsync(string to, string subject, string htmlBody, string textBody, CancellationToken cancellationToken = default);
}
