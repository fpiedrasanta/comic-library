# TASK-API-0244 — Exponer PublisherId y PublisherName en SeriesFilterDto

## Motivo

Detectado durante la revisión de `TASK-PUBLIC-WEB-0061` (revisión final de US-0025). El usuario reportó que al elegir una Serie en el catálogo, la cascada hacia arriba no completa el eslabón de Editorial: la URL queda `?franchiseId=4&seriesId=7` sin `publisherId`, y el autocomplete de Editorial queda vacío.

## Task de origen

`backlog/epic-03/us-0025/public-web/finished/TASK-PUBLIC-WEB-0061 — Revisión, integración y testing de WorksPage.md`

## Trabajo solicitado

Agregar `PublisherId` y `PublisherName` a `SeriesFilterDto`, de forma simétrica a como ya lo hace `FranchiseFilterDto`.

Archivos involucrados:

* `api/Application/DTOs/CatalogFilterDtos.cs` — agregar los dos campos al record `SeriesFilterDto` (líneas 26-31).
* `api/Application/Services/SeriesService.cs` — completar la construcción del DTO en `GetPublicPagedAsync` (líneas 82-87). El `Series` ya expone `Franchise`; la editorial se alcanza por `s.Franchise.Publisher`.

## Contexto necesario

`FranchiseFilterDto` ya expone el dato equivalente y es la referencia a seguir:

```csharp
public record FranchiseFilterDto(
    long Id,
    string Name,
    string? Color,
    long? PublisherId,
    string? PublisherName);
```

Los campos deben ser nulables, igual que en `FranchiseFilterDto`, porque una serie puede no tener franquicia asociada. La navegación es `Series -> Franchise -> Publisher`: cuando `Franchise` es null, `PublisherId` y `PublisherName` también lo son.

`GetPublicSeriesRequest` ya acepta `PublisherId` y `FranchiseId` como filtros (líneas 8-12), y el repositorio ya los combina con `search` en AND. No hace falta tocar filtrado.

## Impacto en el frontend

`api/catalog-repository.ts` ya tipa `GetSeriesParams` con `franchiseId` y `publisherId`. `features/catalog/components/option-mappers.ts` (`seriesOption`) y `types/works.ts` (`SeriesFilterDto`) se actualizan en el Public Web al consumir el campo nuevo. La línea `works-page.tsx:193-201` es un workaround temporal y debe eliminarse cuando este endpoint exponga el dato.

## Dependencias conocidas

Ninguna. Es una extensión aditiva de un DTO público existente. No cambia contratos de request ni rompe clientes actuales: agregar campos a la respuesta es compatible.

## Resultado esperado

`GET /api/series` devuelve, por cada item, además de `id`, `name`, `color`, `franchiseId` y `franchiseName`, los campos `publisherId` y `publisherName` resueltos a través de la franquicia.

Ejemplo esperado:

```json
{
  "id": 7,
  "name": "Fly Vol.1",
  "color": "#ff0000",
  "franchiseId": 4,
  "franchiseName": "Fly",
  "publisherId": 4,
  "publisherName": "Zenescope"
}
```

## Criterios de aceptación

* `SeriesFilterDto` incluye `PublisherId` y `PublisherName`, ambos nulables.
* `SeriesService.GetPublicPagedAsync` los resuelve vía `s.Franchise?.Publisher`.
* Una serie sin franquicia devuelve ambos campos en `null`, sin excepción.
* `GET /api/series` responde con los campos nuevos, también al combinar `publisherId`, `franchiseId` y `search`.
* Los filtros y la paginación existentes no cambian de comportamiento.
* El build del backend finaliza correctamente.
* `endpoints.md` se actualiza si documenta la forma de la respuesta de `GET /api/series`.

## Notas

Requiere aprobación humana (`planned` -> `pending`) antes de ser ejecutada.

Mientras tanto, el Public Web mantiene un workaround temporal descrito en `TASK-PUBLIC-WEB-0061`, con un fallo silencioso conocido: si la serie seleccionada no tiene obras, el publisher no se puede resolver y el autocomplete de Editorial queda vacío sin aviso. Ese workaround debe eliminarse cuando este trabajo esté terminado.

---

# Resultado de ejecución

## Qué se implementó

`SeriesFilterDto` expone ahora `PublisherId` y `PublisherName`, resueltos a través de `Series.Franchise.Publisher`, de forma simétrica a `FranchiseFilterDto`. `GET /api/series` permite completar la cascada Publisher → Franchise → Serie sin depender de que la serie tenga obras asociadas.

```json
{
  "id": 7,
  "name": "Fly Vol.1",
  "color": "#ff0000",
  "franchiseId": 4,
  "franchiseName": "Fly",
  "publisherId": 4,
  "publisherName": "Zenescope"
}
```

## Archivos modificados

- `api/Application/DTOs/CatalogFilterDtos.cs` — dos campos nuevos en `SeriesFilterDto`.
- `api/Application/Services/SeriesService.cs` — `GetPublicPagedAsync` resuelve `s.Franchise?.Publisher?.Id` y `s.Franchise?.Publisher?.Name`.
- `tests/Infrastructure.Tests/Integration/CatalogFilterControllerContractTests.cs` — la forma pública esperada de `SeriesFilterDto` incluye los dos campos.
- `tests/Infrastructure.Tests/Integration/CatalogFilterEndpointsIntegrationTests.cs` — 3 tests nuevos.
- `project/endpoints/endpoints-series.md` — ejemplo de respuesta y descripción del DTO.
- `project/services/services-catalog.md` — campos expuestos por el listado público.

## Decisiones

- Cambio puramente aditivo: no se tocó request, filtros, paginación, ordenamiento ni el Repository. `SeriesRepository.GetPagedAsync` ya carga `Franchise.Publisher`, así que no hay consultas adicionales ni riesgo de N+1.
- Los campos son nulables, igual que en `FranchiseFilterDto`: cuando `Franchise` es null, `PublisherId` y `PublisherName` también lo son. No se lanzó excepción ni se alteró el dominio.
- No se agregó `PublisherName` al DTO de la serie administrativa (`SeriesListItemDto`): ya lo expone vía `PublisherName`, y el alcance de la Task es el contrato público.

## Tests

3 tests nuevos en `CatalogFilterEndpointsIntegrationTests` (34 en total en el archivo):

| Test | Cubre |
| --- | --- |
| `Series_ExposePublisherResolvedThroughFranchise` | para cada serie, `PublisherId` y `PublisherName` coinciden con los de su franchise, y existe al menos una serie con publisher resuelto |
| `Series_WithoutFranchise_ReturnNullPublisher` | toda serie sin franchise devuelve ambos campos en null, sin excepción |
| `Series_ExposePublisherWhenCombiningFilters` | los campos nuevos siguen presentes y correctos al combinar `franchiseId`, `publisherId` y `search` |

Los tests son data-driven sobre la base de desarrollo: no crean ni eliminan datos.

## Verificación

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores**. Solo los 2 warnings preexistentes (`ComicAnalysisParser.cs` CS8603 y `DesignTimeDbContextFactory.cs` CS8604).
- Tests de catálogo: **34/34 en verde**.
- Suite completa sin los tests de workflow: **130/130 en verde**.
- Los 3 tests de workflow (`FullWorkflow`, `EditExistingActiveNumber`, `EditExistingActiveWork`) no se re-ejecutaron en esta corrida: la API estaba en ejecución y bloqueaba las DLL, y resolverlo requería redirigir el output con `-p:OutDir`, lo que rompe sus rutas relativas de assets. No tocan `SeriesFilterDto` ni `SeriesService.GetPublicPagedAsync`, y los tres estaban en verde en la corrida completa anterior de esta misma sesión (130/130 con output por defecto). Los criterios de aceptación de la Task exigen build exitoso, no suite completa.

## Criterios de aceptación

Todos cumplidos: el DTO incluye ambos campos nulables; el Service los resuelve vía `s.Franchise?.Publisher`; una serie sin franquicia devuelve null sin excepción; los campos llegan también al combinar `publisherId`, `franchiseId` y `search`; filtros y paginación no cambian de comportamiento (los tests previos siguen en verde sin modificación); el build finaliza correctamente; y la forma de la respuesta de `GET /api/series` está actualizada en `project/endpoints/endpoints-series.md`.

## Impacto para el Public Web

`TASK-PUBLIC-WEB-0061` queda habilitada para eliminar el workaround de `works-page.tsx:193-201`: puede leer `publisherId` y `publisherName` directamente de la opción de Serie y derivar el `publisherId` de la URL, con lo que también aparece la tercera línea del option según el diseño original.
