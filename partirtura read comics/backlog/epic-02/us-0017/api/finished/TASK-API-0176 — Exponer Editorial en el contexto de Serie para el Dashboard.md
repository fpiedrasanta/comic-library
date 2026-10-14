# TASK-API-0176 — Exponer Editorial en el contexto de Serie para el Dashboard

**Tipo:** Backend / API
**Agente:** API Agent
**Assignee:** API Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Origen:** TASK-DASH-0076 (bloqueada)

## Objetivo

Exponer los datos de la **Editorial** asociada a una Serie para que el Dashboard pueda mostrarla en el header contextual del listado de Números y en el formulario de Número, según US-0017 §17.1 ("El listado debe mostrar información informativa de: Editorial / Franquicia / Serie").

## Contexto

El Dashboard Agent implementó `dashboard/pages/numbers-page.tsx` para el listado de Números y `dashboard/pages/number-form-page.tsx` para el formulario de Número. Ambos esperan mostrar en cabecera:

- Editorial
- Franquicia
- Serie

El `GET /api/admin-series/{id}` devuelve `SeriesDetailDto`, que expone datos de Franquicia pero **no** exponía datos de la Editorial.

El `SeriesListItemDto` (listado de Series) sí incluye `publisherName` y `publisherCountryName`, lo que confirma que la información existe en backend, pero no se estaba exponiendo en el detalle.

## Alcance

Decidir e implementar una de las dos opciones equivalentes:

### Opción A — Extender `SeriesDetailDto` (elegida)

Agregar al DTO devuelto por `GET /api/admin-series/{id}`:

- `publisherId: long`
- `publisherName: string`
- `publisherCountryName: string | null`

Actualizar la documentación del endpoint en `project/endpoints/endpoints-series.md`.

### Opción B — Endpoint de contexto dedicado (descartada)

Exponer un nuevo endpoint (por ejemplo `GET /api/admin-numbers/context/{seriesId}`) que devuelva explícitamente la triada:

```json
{
  "publisherId": 1,
  "publisherName": "DC Comics",
  "publisherCountryName": "United States",
  "franchiseId": 2,
  "franchiseName": "Batman",
  "seriesId": 5,
  "seriesName": "Batman (2016)"
}
```

Documentarlo en `project/endpoints/endpoints-numbers.md`.

## Resultado esperado

El Dashboard podrá mostrar **Editorial** en el header contextual de:

- `dashboard/pages/numbers-page.tsx` (US-0017 §17.1)
- `dashboard/pages/number-form-page.tsx` (US-0017 §19, §2.1)

Esto desbloqueará `TASK-DASH-0076` y `TASK-DASH-0077` (parte del header).

## Criterios de aceptación

- [x] El DTO expone `publisherName` y (cuando aplique) `publisherCountryName` para una Serie existente.
- [x] La información se mantiene consistente con `SeriesListItemDto.publisherName` para una misma Serie.
- [x] La documentación del contrato queda actualizada.
- [x] La solución compila correctamente.
- [x] Los tests existentes de Series siguen pasando.

## Dependencias

- Ninguna externa. Los datos ya están disponibles en backend (visibles en `SeriesListItemDto`).
- Se libera al finalizar: TASK-DASH-0076 y la parte correspondiente de TASK-DASH-0077 (header contextual de la pantalla de Número).

## Documentación a actualizar

- `project/endpoints/endpoints-series.md` ✅
- `project/endpoints/endpoints-numbers.md` (no aplica: se eligió Opción A)
- `project/services/services-application.md` (no aplica: solo se extendió un mapping)
- `project/repositories.md` (no aplica: el repo ya cargaba el join)

## Resultado

### Opción implementada

Opción A — Extender `SeriesDetailDto`.

### Archivos modificados (verificados 2026-09-03)

| Archivo | Cambio |
|---|---|
| `api/Application/DTOs/SeriesDetailDto.cs` | Agregados 3 campos: `PublisherId (long?)`, `PublisherName (string?)`, `PublisherCountryName (string?)`. |
| `api/Application/Services/SeriesService.cs::ToDetailDto` | Mapeo de `series.Franchise?.Publisher?.Id/Name/Country?.Name` al DTO. |
| `project/endpoints/endpoints-series.md` | Payload de `GET /api/admin-series/{seriesId}` extendido con los 3 campos + nota para el Front. |

### Repositorio

`SeriesRepository.GetByIdAsync` ya hacía `.Include(s => s.Franchise).ThenInclude(f => f.Publisher).ThenInclude(p => p.Country)` (líneas 16–18), por lo que **no fue necesario modificar el repositorio**. La query del listado (`GetPagedAsync`) ya cargaba los mismos includes.

### Build

- Exitoso: 0 errores.
- Tests: **180/180 verdes** (128 Application + 52 Infrastructure).

## Conclusiones del Backend Agent para el Front Agent

### Verificación de la queja del Front (2026-09-03)

El Front Agent reportó: "Solo SeriesListItemDto (líneas 1-14) tiene publisherName. SeriesDetailDto (líneas 16-33) NO lo tiene."

**Aclaración:** ese archivo que el Front Agent vió es `dashboard/dashboard/types/series.ts` (tipo TypeScript del Dashboard, líneas 16-33). Es un archivo del **proyecto dashboard**, no del backend.

El DTO de backend SÍ expone los 3 campos. Evidencia directa:

**`api/Application/DTOs/SeriesDetailDto.cs`** (archivo backend actual):
```csharp
public record SeriesDetailDto(
    long Id,
    string Name,
    long FranchiseId,
    string? FranchiseName,
    long? FranchiseImageId,
    string? FranchiseUrlImage,
    string? FranchiseColor,
    bool FranchiseIsFeatured,
    bool FranchiseIsOngoing,
    bool FranchiseIsActive,
    long? PublisherId,           // ← agregado
    string? PublisherName,        // ← agregado
    string? PublisherCountryName, // ← agregado
    long? ImageId,
    string? UrlImage,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    bool IsActive);
```

**`api/Api/Controllers/AdminSeriesController.cs`** línea 33:
```csharp
return Ok(new ApiResponse<SeriesDetailDto>(true, "Series detail retrieved successfully.", StatusCodes.Status200OK, result));
```

El endpoint `GET /api/admin-series/{seriesId}` retorna ese DTO. El JSON real tiene `publisherId`, `publisherName`, `publisherCountryName`.

### Acción requerida del Front Agent

**Actualizar `dashboard/dashboard/types/series.ts`** (interface `SeriesDetailDto`, líneas 16-33) para reflejar el nuevo contrato. Agregar:

```ts
publisherId: number | null
publisherName: string | null
publisherCountryName: string | null
```

Insertarlos después de `franchiseIsActive` y antes de `imageId` para mantener el orden de serialización del backend (record posicional).

### `GET /api/admin-series/{seriesId}` — nuevo contrato

Además de los campos existentes, ahora devuelve:

```json
{
  "publisherId": 1,
  "publisherName": "Marvel",
  "publisherCountryName": "United States"
}
```

- Valores vienen de `Series.Franchise.Publisher.{Id, Name}` y `Series.Franchise.Publisher.Country.Name`.
- Consistentes con los ya expuestos en `SeriesListItemDto` (`GET /api/admin-series`).
- Si una Serie no tiene Franquicia o la Franquicia no tiene Editorial asignada, los 3 campos serán `null`.

### Tareas del Dashboard que se desbloquean

- `TASK-DASH-0076` (header contextual con Editorial en `numbers-page.tsx`).
- Parte de `TASK-DASH-0077` (header en `number-form-page.tsx`).

## Prioridad

Media. Bloquea la finalización de TASK-DASH-0076 y parte de TASK-DASH-0077.