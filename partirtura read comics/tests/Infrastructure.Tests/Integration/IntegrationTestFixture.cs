using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Hosting;
using Hangfire;
using Hangfire.MySql;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Xunit;
using Microsoft.Extensions.Logging.Abstractions;

namespace Infrastructure.Tests.Integration;

public sealed class IntegrationTestFixture : IAsyncLifetime
{
    private IHost? _host;
    public IServiceScopeFactory ScopeFactory { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Development.json", optional: false, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();

        _host = Host.CreateDefaultBuilder()
            .ConfigureServices(services =>
            {
                services.AddSingleton<IConfiguration>(config);
                services.AddDatabase(config);

                services.AddHangfire(configuration =>
                {
                    configuration.UseRecommendedSerializerSettings()
                                 .UseStorage(new MySqlStorage(config.GetConnectionString("DefaultConnection") + ";Allow User Variables=True;", new MySqlStorageOptions
                                 {
                                     PrepareSchemaIfNecessary = true,
                                     TransactionIsolationLevel = System.Transactions.IsolationLevel.ReadCommitted,
                                     QueuePollInterval = TimeSpan.FromSeconds(15)
                                 }));
                });

                services.AddHangfireServer(options =>
                {
                    options.WorkerCount = 2;
                    options.Queues = new[] { "cbr-processing", "ai-analysis", "default" };
                });

                services.AddScoped<IUnitOfWork, UnitOfWork>();
                services.AddScoped<IFileStorageService, FileStorageService>();
                services.AddScoped<IBackgroundJobService, BackgroundJobService>();
                services.AddScoped<ICountryService, CountryService>();
                services.AddScoped<IPublisherService, PublisherService>();
                services.AddScoped<IFranchiseService, FranchiseService>();
                services.AddScoped<ISeriesService, SeriesService>();
                services.AddScoped<IPersonService, PersonService>();
                services.AddScoped<IRoleService, RoleService>();
                services.AddScoped<ITagService, TagService>();
                services.AddScoped<IWorkService, WorkService>();
                services.AddScoped<IRecommendedWorksService, RecommendedWorksService>();
                services.AddScoped<IReadingHistoryService, ReadingHistoryService>();
                services.AddScoped<IWorkRatingService, WorkRatingService>();
                services.AddScoped<IWorkTypeService, WorkTypeService>();
                services.AddScoped<IWorkContentService, WorkContentService>();
                services.AddScoped<IWorkAnalysisService, WorkAnalysisService>();
                services.AddScoped<WorkAnalyzer>();
                services.AddScoped<IListTypeService, ListTypeService>();
                services.AddScoped<IWorkListService, WorkListService>();
                services.AddScoped<IListRatingService, ListRatingService>();
                services.AddScoped<IListReaderService, ListReaderService>();
                services.AddScoped(typeof(ILogger<>), typeof(NullLogger<>));
                services.AddSingleton<IWebHostEnvironment>(new FakeWebHostEnvironment());
            })
            .Build();

        await _host.StartAsync();

        ScopeFactory = _host.Services.GetRequiredService<IServiceScopeFactory>();
    }

    public async Task DisposeAsync()
    {
        if (_host != null)
        {
            await _host.StopAsync();
            _host.Dispose();
        }
    }

    private sealed class FakeWebHostEnvironment : IWebHostEnvironment
    {
        private static readonly string TempRoot = Path.Combine(AppContext.BaseDirectory, "test-wwwroot");

        static FakeWebHostEnvironment()
        {
            Directory.CreateDirectory(TempRoot);
        }

        public string WebRootPath { get; set; } = TempRoot;
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public string ApplicationName { get; set; } = "ComicLibrary.Tests";
        public string EnvironmentName { get; set; } = "Development";
        public IFileProvider WebRootFileProvider { get; set; } = new PhysicalFileProvider(TempRoot);
        public IFileProvider ContentRootFileProvider { get; set; } = new PhysicalFileProvider(AppContext.BaseDirectory);
    }
}

[CollectionDefinition("IntegrationTests")]
public sealed class IntegrationTestCollection : ICollectionFixture<IntegrationTestFixture>
{
}