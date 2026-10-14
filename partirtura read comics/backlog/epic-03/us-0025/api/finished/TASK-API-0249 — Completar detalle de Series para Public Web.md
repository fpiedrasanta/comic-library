# TASK-API-0249 — Completar detalle de Series para Public Web

## Objetivo

Completar el detalle de Series necesario para `/series/{id}` del Public Web.

El endpoint debe devolver:

```text
Id
Name
Description
Color
UrlImage
Franchise
  Id
  Name
Publisher
  Id
  Name
```

Utilizar el endpoint existente de detalle de Series si corresponde. No crear otro endpoint si el existente puede ampliarse sin afectar contratos administrativos.

## Seguridad

* Autenticado: Sí.
* Administrator: No.
* Anónimo: No.
* No utilizar `[AllowAnonymous]`.

## Repository

Revisar la consulta de detalle existente.

Incluir únicamente las relaciones necesarias para obtener:

* Franchise.Id
* Franchise.Name
* Franchise.Publisher.Id
* Franchise.Publisher.Name

Mantener `AsNoTracking` y evitar cargar el grafo completo.

## Service / DTO

Adaptar el DTO público de detalle para devolver la información anterior.

No exponer:

* datos administrativos;
* entidades EF;
* información de almacenamiento;
* campos innecesarios del grafo.

Utilizar el mecanismo existente para `UrlImage`.

## Tests

Adaptar/agregar tests para verificar:

* Series existente devuelve Description.
* Devuelve Franchise Id/Name.
* Devuelve Publisher Id/Name.
* Relaciones inexistentes se manejan correctamente según el dominio.
* No se exponen campos administrativos.
* Series inexistente devuelve `404`.
* Series inactiva devuelve `404`.
* Seguridad existente se mantiene.

## Documentación

Actualizar `endpoints-series.md` y la documentación de repository/service si cambia su comportamiento.

---

# Resultado de ejecución

## Qué se implementó

`GET /api/series/{id}` para la página `/series/{id}` del Public Web, con detalle público de Series autenticado y sin rol `Administrator`.

```json
{
  "id": 5,
  "name": "The Amazing Spider-Man v1",
  "description": "Peter Parker teenage years, with the classic rogues gallery.",
  "color": "#FF0000",
  "urlImage": "/images/12",
  "franchise": { "id": 3, "name": "Spider-Man" },
  "publisher": { "id": 1, "name": "Marvel Comics" }
}
```

Los nueve campos del contrato objetivo tienen contraparte real en el dominio. `Description` existe porque la agregó `TASK-API-0248` inmediatamente antes: esta task no habría sido implementable sin esa.

## Archivos nuevos

- `api/Application/DTOs/PublicSeriesDetailDto.cs` — `PublicSeriesDetailDto` y `PublicSeriesNodeDto`.
- `tests/Infrastructure.Tests/Integration/SeriesDetailContractTests.cs` (8 tests).
- `tests/Infrastructure.Tests/Integration/SeriesDetailIntegrationTests.cs` (11 tests).

## Archivos modificados

- `api/Application/Interfaces/ISeriesRepository.cs` — nueva operación `GetDetailByIdAsync`.
- `api/Infrastructure/Repositories/SeriesRepository.cs` — `GetDetailByIdAsync` con `AsNoTracking` e `Include` de `Image`, `Franchise` y `Franchise.Publisher`.
- `api/Application/Interfaces/ISeriesService.cs` — nueva operación `GetPublicDetailAsync`.
- `api/Application/Services/SeriesService.cs` — implementación y `using Application.Helpers`.
- `api/Api/Controllers/SeriesController.cs` — `[HttpGet("{id:long}")] GetById`.
- `project/endpoints/endpoints-series.md` — sección del detalle público.
- `project/services/services-catalog.md` — operación y comportamiento.
- `project/repositories/repositories-catalog.md` — `GetDetailByIdAsync` y su distinción con `GetByIdAsync`.
- `project/repositories.md` — conteo de `SeriesRepository` 5 → 6.

## Decisiones

### No se reutilizó `WorkCatalogNodeDto` aunque tiene la misma forma

`WorkCatalogNodeDto` es `(Id, Name, Color)`. Los nodos anidados que pide la Task son `(Id, Name)`, sin `Color`. Podría haberse reutilizado y haber aceptado el color de más, pero no se hizo por dos razones: el color no está en el contrato pedido, y el nombre del tipo está scopeado al catálogo de obras (`WorkCatalog`), así que usarlo en el detalle de series sería un nombre engañoso en el lugar equivocado del código. Se creó `PublicSeriesNodeDto`, que es exactamente lo que el contrato pide.

El criterio de la Task era explícito: no exponer campos innecesarios del grafo. Agregar `Color` "porque el tipo ya existe" habría sido ampliar el contrato sin motivo.

### Repository: solo `Image`, `Franchise` y `Franchise.Publisher`

La consulta paginada carga además `Franchise.Publisher.Country` y `Franchise.Image`, porque el listado público devuelve `FranchiseName`, `PublisherName` y `PublisherCountryName`. El detalle no devuelve país, así que esa navegación queda fuera: `AsNoTracking`, una ida y vuelta, sin N+1 y sin grafo completo.

`GetByIdAsync` es el read del camino de escritura (update/deactivate/activate mutan la entidad) y mantiene change tracking. Se agregó `GetDetailByIdAsync` como lectura pura, igual que en `TASK-API-0246` y `TASK-API-0247`. El nombre no lleva "public": el Repository no debe conocer la audiencia.

### Contrato

- DTO nuevo y específico. No se reutilizó `SeriesDetailDto`, que expone `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt`, `ImageId`, y un bloque plano de campos de franchise y publisher (`FranchiseId`, `FranchiseName`, `FranchiseImageId`, `FranchiseUrlImage`, `FranchiseColor`, `FranchiseIsFeatured`, `FranchiseIsOngoing`, `FranchiseIsActive`, `PublisherId`, `PublisherName`, `PublisherCountryName`).
- Nombre `PublicSeriesDetailDto` y no `SeriesDetailDto`: el nombre corto ya está ocupado por el contrato administrativo, igual que pasó con `PublicFranchiseDetailDto` en `TASK-API-0246`.
- El logo se construye con `ImageUrlBuilder.ToUrl`.
- `id <= 0` produce `ValidationException`; serie inexistente o inactiva produce `BusinessNotFoundException` con el mismo mensaje en ambos casos, para no revelar la existencia de un id desactivado.
- Los nodos anidados son nulables y se construyen con acceso null-safe, de modo que una relación ausente produce `null` en lugar de una excepción. En la práctica `Series.FranchiseId` y `Franchise.PublisherId` son ambas FK obligatorias (`SeriesConfiguration.cs`, `FranchiseConfiguration.cs`), así que siempre vienen poblados. Esto cubre el criterio de la Task sobre relaciones inexistentes sin prometer un estado que el modelo no permite.

## Tests

`SeriesDetailContractTests` (8) — `SeriesController` requiere `[Authorize]`, sin `AllowAnonymous` ni `Roles`; expone `GetById` en `api/series/{id:long}` con `(long id, CancellationToken)` y retorno `Task<IActionResult>`; la acción no es anónima; el DTO expone exactamente los siete campos públicos; el nodo expone exactamente `Id` y `Name`; no expone `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt`, `ImageId`, `FranchiseId` plano, `StoragePath` ni `FileName`; la URL de imagen sale del mecanismo de imágenes y una imagen nula produce null; y el contrato público es un tipo distinto del administrativo.

`SeriesDetailIntegrationTests` (11), data-driven sobre la base de desarrollo, sin crear ni eliminar datos:

| Test | Cubre |
| --- | --- |
| `GetPublicDetail_ExistingSeries_ReturnsItsPublicData` | nombre, description y color coinciden con la entidad |
| `GetPublicDetail_ReturnsFranchiseIdAndName` | Franchise Id/Name del nodo anidado |
| `GetPublicDetail_ReturnsPublisherIdAndName` | Publisher Id/Name del nodo anidado |
| `GetPublicDetail_PublisherMatchesTheCatalogFilter` | los nodos coinciden con lo que devuelve `GET /api/series` |
| `GetPublicDetail_ExposesImageUrlWhenImageExists` | `urlImage` es `/images/{id}` cuando hay imagen, y null cuando no |
| `GetPublicDetail_MissingImage_ReturnsNullUrlImage` | toda serie sin imagen devuelve `urlImage: null` |
| `GetPublicDetail_OptionalDataCanBeAbsent` | datos opcionales ausentes no lanzan excepción; franchise y publisher vienen poblados |
| `GetPublicDetail_UnknownSeries_ThrowsNotFound` | id inexistente produce `BusinessNotFoundException` |
| `GetPublicDetail_NonPositiveId_ThrowsValidation` | `0` e id negativo producen `ValidationException` |
| `GetPublicDetail_InactiveSeries_ThrowsNotFound` | toda serie inactiva produce `BusinessNotFoundException` |
| `GetPublicDetail_DoesNotExposeAdministrativeFields` | el contrato no filtra datos administrativos |

`PublisherMatchesTheCatalogFilter` es el test que ata las dos piezas: el detalle y el listado no pueden divergir sobre la cascada franchise → publisher de una serie.

El caso de imagen ausente se cubre dos veces, de forma data-driven y de forma determinista en el contrato con `ImageUrlBuilder.ToUrl(null)`, para que el test no quede vacío si los datos de desarrollo no tienen ninguna serie sin imagen.

## Verificación

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores**.
- Tests nuevos: **20/20** en verde en el filtro `SeriesDetail`.
- Suite completa: **195/195 en verde** (176 previos + 19 nuevos).

## Nota de proceso

El primer build falló con `MSB3021`/`MSB3027` porque la API estaba corriendo y tenía las DLLs bloqueadas. Se preguntó al usuario y la detuvo, en lugar de volver a intentar esquivar el bloqueo por otros medios. El build salió limpio en `Debug` con los comandos normales.

## Verificación pendiente de ejecución manual

Por decisión humana previa, la seguridad se valida por contrato de atributos y no por llamada HTTP, ya que el proyecto de tests no monta la API con `WebApplicationFactory`. Queda para prueba manual contra la API en ejecución:

1. Usuario anónimo a `GET /api/series/{id}` → 401.
2. Usuario autenticado sin rol Administrator → 200.
3. Usuario autenticado con rol Administrator → 200.
4. Id inexistente → 404 con el mensaje estándar.

## Criterios de aceptación

Endpoint: existe `GET /api/series/{id}`, requiere autenticación, no requiere `Administrator`, no admite anónimos.

Datos: devuelve `Description`, `Franchise.Id/Name` y `Publisher.Id/Name`, y `urlImage` mediante `ImageUrlBuilder`. Relaciones inexistentes se manejan sin excepción. No expone datos administrativos, entidades EF ni información de almacenamiento.

Repository: incluye únicamente las navegaciones necesarias, mantiene `AsNoTracking`, sin N+1 y sin grafo completo.

Documentación y pruebas: `endpoints-series.md`, `services-catalog.md` y `repositories-catalog.md` actualizados, más el conteo en `repositories.md`; 19 tests nuevos; build y suite completa en verde. No se modificó el contrato administrativo ni funcionalidad fuera del alcance.
