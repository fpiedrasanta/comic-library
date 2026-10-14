using Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using System.IO;

namespace Infrastructure.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<EmailService> _logger = logger;
    private readonly string _smtpHost = configuration.GetValue<string>("Email:Smtp:Host") ?? string.Empty;
    private readonly int _smtpPort = configuration.GetValue<int>("Email:Smtp:Port");
    private readonly string _smtpUser = configuration.GetValue<string>("Email:Smtp:User") ?? string.Empty;
    private readonly string _smtpPass = configuration.GetValue<string>("Email:Smtp:Pass") ?? string.Empty;
    private readonly string _from = configuration.GetValue<string>("Email:Smtp:From") ?? string.Empty;
    private readonly string _fromName = configuration.GetValue<string>("Email:Smtp:FromName") ?? string.Empty;
    private readonly bool _enableSsl = configuration.GetValue<bool?>("Email:Smtp:EnableSsl") ?? false;
    private readonly string _subject = configuration.GetValue<string>("ValidationMailContent:Subject") ?? "Validate your email";
    private readonly string _htmlTemplatePath = configuration.GetValue<string>("ValidationMailContent:HtmlTemplatePath") ?? string.Empty;
    private readonly string _textTemplatePath = configuration.GetValue<string>("ValidationMailContent:TextTemplatePath") ?? string.Empty;
    private readonly string _passwordResetSubject = configuration.GetValue<string>("PasswordResetMailContent:Subject") ?? "Recuperá tu contraseña";
    private readonly string _passwordResetHtmlTemplatePath = configuration.GetValue<string>("PasswordResetMailContent:HtmlTemplatePath") ?? string.Empty;
    private readonly string _passwordResetTextTemplatePath = configuration.GetValue<string>("PasswordResetMailContent:TextTemplatePath") ?? string.Empty;
    private readonly string _accountDeletionSubject = configuration.GetValue<string>("AccountDeletionMailContent:Subject") ?? "Eliminá tu cuenta";
    private readonly string _accountDeletionHtmlTemplatePath = configuration.GetValue<string>("AccountDeletionMailContent:HtmlTemplatePath") ?? string.Empty;
    private readonly string _accountDeletionTextTemplatePath = configuration.GetValue<string>("AccountDeletionMailContent:TextTemplatePath") ?? string.Empty;

    public async Task SendEmailValidationAsync(string email, string token, int expiresInMinutes, CancellationToken cancellationToken = default)
    {
        var placeholders = new Dictionary<string, string>
        {
            ["{{code}}"] = token,
            ["{{time to expire}}"] = $"{expiresInMinutes * 60} segundos"
        };

        var htmlBody = await LoadTemplateAsync(_htmlTemplatePath, placeholders, cancellationToken);
        var textBody = await LoadTemplateAsync(_textTemplatePath, placeholders, cancellationToken) ?? string.Empty;

        await SendEmailAsync(email, _subject, htmlBody ?? string.Empty, textBody, cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(string email, string code, int expiresInMinutes, CancellationToken cancellationToken = default)
    {
        var placeholders = new Dictionary<string, string>
        {
            ["{{code}}"] = code,
            ["{{time to expire}}"] = $"{expiresInMinutes * 60} segundos"
        };

        var htmlBody = await LoadTemplateAsync(_passwordResetHtmlTemplatePath, placeholders, cancellationToken) ?? string.Empty;
        var textBody = await LoadTemplateAsync(_passwordResetTextTemplatePath, placeholders, cancellationToken) ?? string.Empty;

        await SendEmailAsync(email, _passwordResetSubject, htmlBody, textBody, cancellationToken);
    }

    public async Task SendAccountDeletionCodeAsync(string email, string code, int expiresInMinutes, CancellationToken cancellationToken = default)
    {
        var placeholders = new Dictionary<string, string>
        {
            ["{{code}}"] = code,
            ["{{time to expire}}"] = $"{expiresInMinutes * 60} segundos"
        };

        var htmlBody = await LoadTemplateAsync(_accountDeletionHtmlTemplatePath, placeholders, cancellationToken) ?? string.Empty;
        var textBody = await LoadTemplateAsync(_accountDeletionTextTemplatePath, placeholders, cancellationToken) ?? string.Empty;

        await SendEmailAsync(email, _accountDeletionSubject, htmlBody, textBody, cancellationToken);
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, string textBody, CancellationToken cancellationToken = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;

        var builder = new BodyBuilder();

        if (!string.IsNullOrEmpty(textBody))
        {
            builder.TextBody = textBody;
        }

        if (!string.IsNullOrEmpty(htmlBody))
        {
            builder.HtmlBody = htmlBody;
        }

        message.Body = builder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, _enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, cancellationToken);
            await client.AuthenticateAsync(_smtpUser, _smtpPass, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent to {Email}. Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
            throw;
        }
    }

    private static async Task<string?> LoadTemplateAsync(string path, Dictionary<string, string> placeholders, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
        {
            return null;
        }

        var content = await File.ReadAllTextAsync(path, cancellationToken);
        foreach (var placeholder in placeholders)
        {
            content = content.Replace(placeholder.Key, placeholder.Value);
        }

        return content;
    }
}
