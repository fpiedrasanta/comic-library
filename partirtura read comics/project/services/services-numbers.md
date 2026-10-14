# Services — Numbers

Application services for number/content management, AI analysis, and CBR processing.

## NumberService

- **Location**: `Application/Services/NumberService.cs`
- **Controller**: `AdminNumbersController`
- **Dependencies**: `INumberRepository`, `ISeriesRepository`, `ILanguageRepository`, `IPersonRepository`, `IRoleRepository`, `ITagRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, detail, create, update, deactivate, activate
- **Notes**: Validates number required, title required, language existence, publication date required. Number + SeriesId must be unique. Syncs PersonByRoles and TagByNumbers. Manages bidirectional continuity relationships. Validates previous/number belong to same series. Cover management integrated into create/update (no independent image endpoints). ContentStatus independent of IsActive.

## NumberContentService

- **Location**: `Application/Services/NumberContentService.cs`
- **Controller**: `AdminNumbersController`
- **Dependencies**: `INumberRepository`, `IImageRepository`, `IPageRepository`, `IFileStorageService`, `IUnitOfWork`, `IBackgroundJobService`
- **Operations**: CBR/CBZ upload, cover selection, image listing, content status, retry, delete. Idempotent content lifecycle.

## NumberRelationsService

- **Location**: `Application/Services/NumberRelationsService.cs`
- **Controller**: (not exposed to controllers)
- **Dependencies**: `INumberRepository`, `IPersonRepository`, `IRoleRepository`, `ITagRepository`, `IUnitOfWork`
- **Operations**: Internal-only sync of PersonByRoles, Tags, and continuity (PreviousNumber/NextNumber). Used by `NumberService.CreateNumberAsync` and `UpdateNumberAsync`.

## AI Providers (Infrastructure)

### HttpAIProviderBase
- **Location**: `Infrastructure/Services/HttpAIProviderBase.cs`
- **Dependencies**: `IHttpClientFactory`
- **Behavior**: Shared HTTP/JSON logic for AI providers.

### GeminiProvider
- **Location**: `Infrastructure/Services/GeminiProvider.cs`
- **Dependencies**: `IHttpClientFactory`, `IConfiguration`
- **Behavior**: AI completions via Google Gemini API (text + images).

### OpenRouterProvider
- **Location**: `Infrastructure/Services/OpenRouterProvider.cs`
- **Dependencies**: `IHttpClientFactory`, `IConfiguration`
- **Behavior**: AI completions via OpenRouter API (text + images).

### OllamaProvider
- **Location**: `Infrastructure/Services/OllamaProvider.cs`
- **Dependencies**: `IHttpClientFactory`, `IConfiguration`
- **Behavior**: AI completions via local Ollama API (text + images).

### AIProviderResolver
- **Location**: `Infrastructure/Services/AIProviderResolver.cs`
- **Dependencies**: `IEnumerable<IAIProvider>`, `IConfiguration`
- **Behavior**: Resolves configured AI provider by name. Throws `ArgumentException` / `InvalidOperationException` for unknown providers.

## Background Jobs (Infrastructure)

### BackgroundJobService
- **Location**: `Infrastructure/Services/BackgroundJobService.cs`
- **Dependencies**: `IBackgroundJobClient` (Hangfire)
- **Behavior**: Enqueues Hangfire background jobs.

### CbrProcessingJob
- **Location**: `Infrastructure/Jobs/CbrProcessingJob.cs`
- **Dependencies**: `IServiceProvider` (Hangfire requires it), `ILogger<CbrProcessingJob>`, `IHostEnvironment`
- **Behavior**: Hangfire job that processes CBR/CBZ files: extracts images via SharpCompress, converts to WebP via Magick.NET, persists Pages + Images, manages Processing/Completed/Error states, performs idempotent cleanup on retry, batches SaveChanges, deletes temporary file. Idempotent via `[DisableConcurrentExecution(1800)]` and `ContentStatus` guard.
- **Notes**: Uses `using` scope inside the method for scoped dependencies. Validates file path with `CbrFileValidator.IsPathWithinTempRoot`. Cleans up temp file in `finally` block.