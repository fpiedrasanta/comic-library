using Api.Middleware;
using Serilog.Events;
using Serilog.Parsing;
using Xunit;

namespace Infrastructure.Tests.Logging;

public class SensitiveDataRedactionEnricherTests
{
    [Fact]
    public void Enrich_PasswordProperty_Redacts()
    {
        var enricher = new SensitiveDataRedactionEnricher();
        var properties = new List<LogEventProperty>
        {
            new("Password", new ScalarValue("mySecret123"))
        };
        var logEvent = new LogEvent(
            DateTimeOffset.UtcNow,
            LogEventLevel.Information,
            null,
            new MessageTemplate("test", new MessageTemplateToken[0]),
            properties);

        enricher.Enrich(logEvent, new TestPropertyFactory());

        var redacted = logEvent.Properties["Password"];
        Assert.Equal("***REDACTED***", ((ScalarValue)redacted).Value);
    }

    [Theory]
    [InlineData("Code")]
    [InlineData("Token")]
    [InlineData("Authorization")]
    [InlineData("ApiKey")]
    [InlineData("IdToken")]
    [InlineData("PasswordResetCode")]
    [InlineData("EmailValidationToken")]
    public void Enrich_SensitivePropertyName_Redacts(string propertyName)
    {
        var enricher = new SensitiveDataRedactionEnricher();
        var properties = new List<LogEventProperty>
        {
            new(propertyName, new ScalarValue("sensitive-value"))
        };
        var logEvent = new LogEvent(
            DateTimeOffset.UtcNow,
            LogEventLevel.Information,
            null,
            new MessageTemplate("test", new MessageTemplateToken[0]),
            properties);

        enricher.Enrich(logEvent, new TestPropertyFactory());

        Assert.Equal("***REDACTED***", ((ScalarValue)logEvent.Properties[propertyName]).Value);
    }

    [Theory]
    [InlineData("Email")]
    [InlineData("UserId")]
    [InlineData("NumberValue")]
    [InlineData("Title")]
    public void Enrich_NonSensitiveProperty_Preserved(string propertyName)
    {
        var enricher = new SensitiveDataRedactionEnricher();
        var properties = new List<LogEventProperty>
        {
            new(propertyName, new ScalarValue("safe-value"))
        };
        var logEvent = new LogEvent(
            DateTimeOffset.UtcNow,
            LogEventLevel.Information,
            null,
            new MessageTemplate("test", new MessageTemplateToken[0]),
            properties);

        enricher.Enrich(logEvent, new TestPropertyFactory());

        Assert.Equal("safe-value", ((ScalarValue)logEvent.Properties[propertyName]).Value);
    }

    [Fact]
    public void Enrich_CaseInsensitive_MatchesLowerAndUpper()
    {
        var enricher = new SensitiveDataRedactionEnricher();
        var properties = new List<LogEventProperty>
        {
            new("password", new ScalarValue("lower")),
            new("PASSWORD", new ScalarValue("UPPER")),
        };
        var logEvent = new LogEvent(
            DateTimeOffset.UtcNow,
            LogEventLevel.Information,
            null,
            new MessageTemplate("test", new MessageTemplateToken[0]),
            properties);

        enricher.Enrich(logEvent, new TestPropertyFactory());

        Assert.Equal("***REDACTED***", ((ScalarValue)logEvent.Properties["password"]).Value);
        Assert.Equal("***REDACTED***", ((ScalarValue)logEvent.Properties["PASSWORD"]).Value);
    }

    private class TestPropertyFactory : Serilog.Core.ILogEventPropertyFactory
    {
        public LogEventProperty CreateProperty(string name, object? value, bool destructureObjects = false)
        {
            return new LogEventProperty(name, new ScalarValue(value));
        }
    }
}
