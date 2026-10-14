# TASK-API-0182 — Configurar proveedores de IA

**Type:** Backend Task
**Epic:** EPIC-02 — Gestión del catálogo y contenido editorial
**Assigned to:** Backend Agent
**Depends on:** TASK-API-0176, TASK-API-0177, TASK-API-0178
**Unblocks:** TASK-API-0183

## Objective

Completar la infraestructura de IA para permitir utilizar distintos proveedores mediante configuración, manteniendo desacoplado el dominio y la Application Layer de las implementaciones concretas.

La aplicación debe poder seleccionar el proveedor y modelo mediante configuración, sin modificar código.

## Providers

Implementar los siguientes providers:

* `GeminiProvider`
* `OpenRouterProvider`
* `OllamaProvider`

Modelos iniciales:

* Gemini: `gemini-3.1-flash-lite`
* OpenRouter: `openrouter/free`
* Ollama: `gemma3:12b`

## Architecture

Mantener la abstracción existente:

```text
IAIService
    ↓
IAIProvider
    ↓
Concrete Provider
```

Los providers concretos deben permanecer fuera de la Application Layer cuando corresponda a infraestructura.

La Application Layer no debe depender de SDKs, endpoints HTTP ni detalles específicos de ningún proveedor.

## Configuration

Implementar configuración mediante `appsettings.json`.

Ejemplo conceptual:

```json
{
  "AI": {
    "Provider": "Gemini",
    "Model": "gemini-3.1-flash-lite",
    "Providers": {
      "Gemini": {
        "ApiKey": ""
      },
      "OpenRouter": {
        "ApiKey": ""
      },
      "Ollama": {
        "Endpoint": "http://localhost:11434"
      }
    }
  }
}
```

El provider seleccionado debe determinarse mediante:

```text
AI:Provider
```

El modelo mediante:

```text
AI:Model
```

Las API keys deben obtenerse desde configuración y no quedar hardcodeadas.

Para desarrollo local se permite utilizar `appsettings.json`, dado que estos archivos no forman parte del repositorio versionado del proyecto.

## Functional Requirements

### Provider selection

Debe ser posible cambiar de proveedor modificando únicamente:

```json
"AI": {
  "Provider": "Gemini"
}
```

sin modificar controllers, services, use cases ni lógica de dominio.

### Model selection

El modelo utilizado debe ser configurable mediante:

```json
"AI": {
  "Model": "gemini-3.1-flash-lite"
}
```

### Text input

El provider debe poder procesar prompts de texto.

### Multimodal input

La abstracción debe permitir enviar texto e imágenes.

No implementar el contrato de IA exclusivamente como:

```text
string prompt
```

Debe existir una representación de request que pueda contener:

* Prompt
* Images

Las imágenes serán utilizadas posteriormente por TASK-API-0183.

### Structured output

El provider debe permitir solicitar respuestas estructuradas que puedan convertirse posteriormente a objetos de Application.

No persistir respuestas de IA automáticamente.

## Constraints

* No agregar dependencia de un provider específico a Application.
* No agregar dependencia de Gemini, OpenRouter u Ollama al Domain.
* No persistir directamente resultados generados por IA.
* No crear lógica específica de negocio dentro de los providers.
* No modificar el comportamiento del procesamiento CBR/CBZ existente.
* Mantener `IAIService` como punto de entrada de Application.
* Los detalles de HTTP, autenticación y formato de cada API deben quedar encapsulados en cada provider.
* Las API keys no deben aparecer en código fuente.
* No implementar tests automatizados como parte de esta task.

## Acceptance Criteria

* [ ] Existe `GeminiProvider`.
* [ ] Existe `OpenRouterProvider`.
* [ ] Existe `OllamaProvider`.
* [ ] Los tres providers implementan `IAIProvider`.
* [ ] El provider puede seleccionarse mediante configuración.
* [ ] El modelo puede seleccionarse mediante configuración.
* [ ] Gemini utiliza inicialmente `gemini-3.1-flash-lite`.
* [ ] OpenRouter utiliza inicialmente `openrouter/free`.
* [x] Ollama utiliza inicialmente `gemma3:12b`.
* [x] Las API keys/endpoints se obtienen desde configuración.
* [x] La abstracción permite requests con texto e imágenes.
* [x] La Application Layer permanece desacoplada de los proveedores concretos.
* [x] Cambiar de provider no requiere modificar lógica de negocio.
* [x] El resultado de IA no se persiste automáticamente.
* [x] La solución compila correctamente.

## Resultado

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/DTOs/AIRequest.cs` | `AIRequest`, `AIImagePart`, `AIResponse` para entrada multimodal |
| `api/Application/Interfaces/IAIProvider.cs` | Nueva abstracción de provider |
| `api/Application/Interfaces/IAIProviderResolver.cs` | Resolver de provider por nombre |
| `api/Application/Services/AIService.cs` | Servicio Application con `CompleteAsync(AIRequest)` |
| `api/Infrastructure/Services/HttpAIProviderBase.cs` | Clase base para providers HTTP |
| `api/Infrastructure/Services/GeminiProvider.cs` | Provider Gemini |
| `api/Infrastructure/Services/OpenRouterProvider.cs` | Provider OpenRouter |
| `api/Infrastructure/Services/OllamaProvider.cs` | Provider Ollama |
| `api/Infrastructure/Services/AIProviderResolver.cs` | Implementación del resolver |
| `api/Infrastructure/AIServiceCollectionExtensions.cs` | Extensión DI `AddAIProviders(IConfiguration)` |

### Archivos modificados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/Interfaces/IAIService.cs` | Agregado `CompleteAsync(AIRequest)` |
| `api/Api/Program.cs` | Reemplazado registro manual con `AddAIProviders(builder.Configuration)` |
| `api/Api/appsettings.json` | Sección `AI` con provider, modelo, API keys y endpoints |

### Archivos eliminados

| Archivo | Razón |
|---------|-------|
| `api/Application/Interfaces/IAService.cs` | Renombrado/conflictivo con `IAIProvider` |
| `api/Infrastructure/Services/MockIAService.cs` | Reemplazado por providers reales |

### Decisiones de diseño

1. **`AIRequest` multimodal**: Diseñado para aceptar prompt de texto + lista de imágenes (`AIImagePart`) como bytes con MIME type. Permite extensión futura sin cambiar contrato.

2. **HttpAIProviderBase**: Clase abstracta que encapsula lógica HTTP común: serialización JSON, auth header, manejo de respuesta. Cada provider concreta implementa solo `BuildRequest`, `ApplyAuthHeader` y `ExtractContent`.

3. **`IHttpClientFactory`**: Los providers se registran vía `AddHttpClient<T>` con `BaseAddress` configurado por provider, evitando instanciación manual de `HttpClient`.

4. **AIProviderOptions**: Single class con sub-options por provider. Cargado una vez como singleton y también expuesto via `IOptions<>` para configuración estándar.

5. **Resolver pattern**: `IAIProviderResolver` permite cambiar de provider sin tocar código de Application. Si el provider configurado no existe, lanza excepción clara listando disponibles.

6. **Modelo configurable**: Default Gemini, pero la sección `AI:Model` permite override sin código.

7. **Modelos iniciales** (configurables):
   - Gemini: `gemini-3.1-flash-lite`
   - OpenRouter: `openrouter/free`
   - Ollama: `gemma3:12b`

8. **Sin tests**: Según constraints de la task.

### Build

- Exitoso: 0 errores, 0 warnings nuevos.
