using Api.DTOs;
using Api.Middleware;
using Application.Configuration;
using Application.Interfaces;
using Application.Services;
using Hangfire;
using Hangfire.MySql;
using Infrastructure;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Seed;
using Infrastructure.Services;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using System.Transactions;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.With(new SensitiveDataRedactionEnricher())
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers(options =>
{
    options.ModelBinderProviders.Insert(0, new Api.ModelBinders.NullableLongModelBinderProvider());
})
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = true;
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(kvp => kvp.Value?.Errors.Count > 0)
                .Select(kvp => new
                {
                    Field = kvp.Key,
                    Errors = kvp.Value!.Errors.Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid value." : e.ErrorMessage).ToArray()
                })
                .ToArray();

            var joined = string.Join("; ", errors.SelectMany(e => e.Errors));
            var result = new ApiResponse<object>(false, "Bad request", StatusCodes.Status400BadRequest, new { detail = joined });
            return new BadRequestObjectResult(result);
        };
    });

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 300_000_000; // 300 MB
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 300_000_000; // 300 MB
});

builder.Services.AddOpenApi();
builder.Services.AddDatabase(builder.Configuration);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

if (allowedOrigins.Length == 0)
{
    if (builder.Environment.IsProduction())
    {
        throw new InvalidOperationException(
            "Cors:AllowedOrigins must contain at least one origin in production. " +
            "Set the section in appsettings.json or via the Cors__AllowedOrigins environment variable.");
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.SetIsOriginAllowed(_ => true);
        }
        else
        {
            policy.WithOrigins(allowedOrigins);
        }
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddHealthChecks();
builder.Services.AddComicLibraryRateLimiter();

builder.Services.AddAIProviders(builder.Configuration);

builder.Services.AddScoped<IBanService, BanService>();
builder.Services.AddScoped<IPublisherService, PublisherService>();
builder.Services.AddScoped<IFranchiseService, FranchiseService>();
builder.Services.AddScoped<ISeriesService, SeriesService>();
builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IListTypeService, ListTypeService>();
builder.Services.AddScoped<IWorkListService, WorkListService>();
builder.Services.AddScoped<IWorkService, WorkService>();
builder.Services.AddScoped<IWorkContentService, WorkContentService>();
builder.Services.AddScoped<IWorkAnalysisService, WorkAnalysisService>();
builder.Services.AddScoped<WorkAnalyzer>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IWorkTypeService, WorkTypeService>();
builder.Services.AddScoped<IUserQueryService, UserQueryService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IPasswordResetCodeService, PasswordResetCodeService>();
builder.Services.AddScoped<IAccountDeletionCodeService, AccountDeletionCodeService>();
builder.Services.AddScoped<IPasswordResetAuthorizationService, PasswordResetAuthorizationService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<IAccountDeletionService, AccountDeletionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGoogleAuthenticationService, GoogleAuthenticationService>();
builder.Services.AddScoped<IWorkService, WorkService>();
builder.Services.AddScoped<IRecommendedWorksService, RecommendedWorksService>();
builder.Services.AddScoped<IReadingHistoryService, ReadingHistoryService>();
builder.Services.AddScoped<IWorkRatingService, WorkRatingService>();
builder.Services.AddScoped<IListRatingService, ListRatingService>();
builder.Services.AddScoped<IListReaderService, ListReaderService>();
builder.Services.AddScoped<IWorkRepository, WorkRepository>();

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IPasswordValidator, PasswordValidator>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IBackgroundJobService, BackgroundJobService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IRefreshTokenGenerator, RefreshTokenGenerator>();
builder.Services.AddScoped<IRefreshTokenHasher, RefreshTokenHasher>();

builder.Services.AddScoped<IEmailTokenSettingsProvider, EmailTokenSettingsProvider>();
builder.Services.AddScoped<IRefreshTokenSettingsProvider, RefreshTokenSettingsProvider>();
builder.Services.AddScoped<IRefreshTokenCookieSettingsProvider, RefreshTokenCookieSettingsProvider>();
builder.Services.AddScoped<IGoogleClientSettingsProvider, GoogleClientSettingsProvider>();
builder.Services.AddScoped<IAccountDeletionTokenSettingsProvider, AccountDeletionTokenSettingsProvider>();

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<IInitialAdminSeeder, InitialAdminSeeder>();

builder.Services.AddHangfire(configuration =>
{
    configuration.UseRecommendedSerializerSettings()
                 .UseStorage(new MySqlStorage(builder.Configuration.GetConnectionString("DefaultConnection") + ";Allow User Variables=True;", new MySqlStorageOptions
                 {
                     PrepareSchemaIfNecessary = true,
                     TransactionIsolationLevel = IsolationLevel.ReadCommitted,
                     QueuePollInterval = TimeSpan.FromSeconds(15)
                 }));
});
builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 2;
    options.Queues = new[] { "cbr-processing", "ai-analysis", "default" };
});

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateOnStart();

builder.Services.AddSingleton<IValidateOptions<JwtOptions>, JwtOptionsValidator>();

var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? new JwtOptions();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            RoleClaimType = "role",
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Authentication failed for {Path}. Reason: {Reason}",
                    context.HttpContext.Request.Path,
                    context.Exception?.Message ?? "Unknown error");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Authentication challenge for {Path}. Error: {Error}",
                    context.HttpContext.Request.Path,
                    context.Properties?.Items.TryGetValue("error", out var error) == true ? error : "No valid token provided");

                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    success = false,
                    message = "Se generÃ³ un error durante el proceso de autenticaciÃ³n.",
                    code = StatusCodes.Status401Unauthorized,
                    payload = new { detail = "Se generÃ³ un error durante el proceso de autenticaciÃ³n." }
                };

                return context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Infrastructure.Persistence.ApplicationDbContext>();
    db.Database.Migrate();
}

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IInitialAdminSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseMiddleware<RateLimitResponseMiddleware>();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.UseCors("DefaultCors");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard("/hangfire");

app.MapGet("/", () => Results.Ok(new { message = "ComicLibrary API is running." }))
   .WithName("Health");

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
   .WithName("HealthCheck");

app.MapControllers();

app.Run();

