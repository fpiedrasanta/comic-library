# TASK-API-0187 — Crear Number con CBR en un solo request

**Tipo:** Backend / API
**Agente:** API Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**User Story:** US-0017
**Tarea Dashboard bloqueada:** TASK-DASH-0077, TASK-DASH-0078

## Problema

El flujo de alta de Number según la maqueta UX/UI (`ux_ui/form-numero.html`) requiere que el administrador pueda crear el número y subir el CBR/CBZ en un **mismo paso**, con un nombre/título inicial.

Actualmente, el backend obliga a:
1. `POST /api/admin-numbers` → crear número
2. `POST /api/admin-numbers/{id}/content` → subir CBR

Esto rompe el flujo deseado y obliga al Dashboard a implementar workarounds o flujos de dos pasos.

## Flujo deseado

1. **Alta**: el administrador envía `SeriesId` + `Title` (nombre/título inicial) + `ContentFile` (CBR/CBZ) en un solo request.
2. El backend crea un **Number (entity)** con el título inicial y encola el procesamiento del CBR/CBZ automáticamente.
3. Mientras procesa, el Number (entity) queda en `contentStatus = Processing`.
4. Una vez finalizado, el administrador puede **editar** el Number (entity) con `PUT /api/admin-numbers/{id}` para completar/actualizar todos los campos, incluyendo el título real sugerido por la IA.

> Nota: en el alta se envía `Title` (nombre/título inicial). El `NumberValue` se define después, en edición, una vez que la IA procesó el CBR o el administrador lo confirma.

## Objetivo

Crear un endpoint dedicado para el alta con CBR, sin extender el `POST /api/admin-numbers` existente.

## Requerimiento

### POST /api/admin-numbers/with-content

Endpoint nuevo dedicado al alta con CBR en un solo paso.

**Request:**
- Content-Type: `multipart/form-data`
- Campos:
  - `SeriesId` (long, required)
  - `Title` (string, required) — nombre/título inicial del número
  - `ContentFile` (file, optional) — CBR/CBZ

**Comportamiento:**
- Crear Number con `SeriesId` y `Title`.
- Si `ContentFile` está presente: encolar procesamiento Hangfire → retornar `NumberDetailDto` con `contentStatus = Processing`.
- Si `ContentFile` no está presente: retornar `NumberDetailDto` con `contentStatus = Missing`.

**Response:**
- 200 OK con `NumberDetailDto` incluyendo `contentStatus`, `contentError` (si aplica).

## Criterios de aceptación

- El administrador puede crear un Number y subir el CBR/CBZ en un solo request.
- El Number se crea con `SeriesId` y `Title` (nombre/título inicial) únicamente.
- El backend encola el procesamiento del CBR/CBZ automáticamente cuando se envía archivo.
- El response incluye `contentStatus` reflejando el estado inicial del procesamiento.
- El endpoint existente `POST /api/admin-numbers` mantiene su comportamiento actual sin cambios.
- El endpoint reutiliza la lógica existente de procesamiento de contenido (no duplicar workers).
- El `PUT /api/admin-numbers/{id}` permite actualizar todos los campos editables del Number una vez finalizado el procesamiento.

## Flujo esperado post-backend

1. **Alta**: `POST /api/admin-numbers/with-content` con `SeriesId` + `Title` + `ContentFile`
2. **Espera**: el Number queda en `Processing`, el frontend consulta `GET /api/admin-numbers/{id}/content/status` cada 10 segundos
3. **Finalizado**: cuando `status = Completed`, el frontend habilita la edición completa
4. **Edición**: `PUT /api/admin-numbers/{id}` con título real + todos los campos actualizados por la IA + el administrador

## Bloquea

- TASK-DASH-0077: Implementar Nuevo/Editar Número y flujo de procesamiento
- TASK-DASH-0078: Validar coherencia entre maquetas UX/UI y contrato Backend

## Asignado a

API Agent.

---

## Resultado de ejecución

### Qué se implementó

- **Endpoint `POST /api/admin-numbers/with-content`**: crea un Number con `SeriesId` + `Title` y opcionalmente sube un archivo CBR/CBZ en un solo request.
- **`NumberService.CreateNumberWithContentAsync`**: valida SeriesId y Title, verifica que la serie exista y esté activa, crea el Number con estado mínimo, y si se proporciona contenido, establece `ContentStatus = Processing` y delega a `INumberContentService.UploadCbrAsync` para encolar el procesamiento Hangfire.
- **`CbrProcessingJob`**: modificado para permitir que el job pro siga cuando el HTTP layer ya estableció `ContentStatus = Processing`, en lugar de retornar temprano.
- **Entidad `Number`**: `LanguageId` y `PublicationDate` hechos nulables para soportar creación mínima.
- **DTOs**: `NumberDetailDto` y `NumberListItemDto` actualizados con `LanguageId` y `PublicationDate` como nullable.
- **Migration**: `20260903194748_MakeLanguageIdAndPublicationDateNullable` creada y aplicada al modelo.
- **Tests unitarios**: 5 tests nuevos en `NumberServiceTests.cs` cubriendo creación con/sin contenido, serie no encontrada, serie inactiva, validaciones.
- **Fakes actualizados**: `Fakes.cs` extendido con `FakeSeriesRepository`, `FakeLanguageRepository`, `FakeImageUploadService`, `FakeNumberContentService`, `FakeNumberRelationsService`, `FakeNumberRepositoryForService`, `NumberExtensions.Clone()`.

### Archivos modificados/creados

1. `api/Domain/Entities/Number.cs` — LanguageId y PublicationDate nullable, Language nullable
2. `api/Infrastructure/Persistence/Configurations/NumberConfiguration.cs` — Language FK IsRequired(false), PublicationDate IsRequired removed, DeleteBehavior.SetNull
3. `api/Infrastructure/Migrations/20260903194748_MakeLanguageIdAndPublicationDateNullable.Designer.cs` — migration (auto-generated)
4. `api/Infrastructure/Migrations/20260903194748_MakeLanguageIdAndPublicationDateNullable.cs` — migration code (auto-generated)
5. `api/Application/DTOs/NumberDetailDto.cs` — LanguageId: long?, LanguageName: string?, PublicationDate: DateTime?
6. `api/Application/DTOs/NumberListItemDto.cs` — LanguageId: long?, LanguageName: string?, PublicationDate: DateTime?
7. `api/Application/DTOs/CreateNumberWithContentRequest.cs` — NEW: record con SeriesId, Title, ContentFileData?, ContentFileName?
8. `api/Api/DTOs/NumberFormRequests.cs` — Added `CreateNumberWithContentFormRequest`
9. `api/Application/Interfaces/INumberService.cs` — Added `CreateNumberWithContentAsync` signature
10. `api/Application/Services/NumberService.cs` — Added `INumberContentService` dependency, `CreateNumberWithContentAsync` + helper methods, updated DTO mappings
11. `api/Infrastructure/Jobs/CbrProcessingJob.cs` — Modified idempotency check to proceed when ContentStatus is already Processing
12. `api/Api/Controllers/AdminNumbersController.cs` — Added `CreateWithContent` endpoint
13. `project/endpoints/endpoints-numbers.md` — Added endpoint documentation
14. `tests/Application.Tests/Fakes/Fakes.cs` — Added fakes for testing
15. `tests/Application.Tests/Services/NumberServiceTests.cs` — NEW: 5 unit tests

### Decisiones relevantes

- **LanguageId y PublicationDate nullable**: Necesario para permitir creación mínima del Number sin requerir campos opcionales. El admin los completará después vía `PUT`.
- **No duplicate check on Title**: No hay restricción de unicidad en Title, y NumberValue queda vacío durante la creación mínima. La unicidad de (SeriesId, NumberValue) se mantiene.
- **CbrProcessingJob idempotency**: Cambiado de "retornar si Processing" a "saltar el seteo de Processing pero continuar ejecutando" — permite que el job procese el archivo aunque el HTTP layer ya establezca el estado en Processing antes de encolar.
- **INumberContentService injected into NumberService**: 7 dependencias (dentro del límite permitido). Reutiliza `UploadCbrAsync` existente en lugar de duplicar lógica de procesamiento.

### Build y tests

- Build: exitoso (0 errores, warnings preexistentes)
- Tests Application.Tests: 140 pasados (5 nuevos)
- Tests Infrastructure.Tests: 65 pasados
- Total: 205 tests, 0 fallas
