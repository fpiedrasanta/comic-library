# TASK-API-0246 — Exponer detalle de Franchise para Public Web

## Objetivo

Exponer el detalle de una Franchise para la página:

`/franchises/{id}`

mediante:

`GET /api/franchises/{id}`

El endpoint es para **usuarios autenticados de Public Web**.

* Autenticado: Sí.
* Administrator: No.
* Anónimo: No.
* No utilizar `[AllowAnonymous]`.

## Datos

El response debe exponer únicamente los datos necesarios para el header de Franchise:

```text
Id
Name
Description
Color
UrlImage
```

No exponer campos administrativos ni datos internos de persistencia.

Reutilizar las convenciones de nombres existentes del proyecto para `UrlImage`, `Color`, etc.

### Imagen

La imagen debe utilizar el mecanismo existente de `ImageUrlBuilder`.

No exponer `StoragePath`, `FileName` ni rutas físicas.

### Repository

Agregar una operación específica de lectura para el detalle:

* `AsNoTracking`.
* Incluir únicamente las relaciones necesarias para obtener la imagen.
* No cargar el grafo completo de Franchise.
* Evitar N+1.

No reutilizar una operación administrativa si su contrato o comportamiento expone información innecesaria.

### Service

Agregar el método correspondiente en `IFranchiseService` / `FranchiseService`.

Responsabilidades:

* validar el `id`;
* obtener la entidad mediante el repository;
* mapear al DTO específico;
* utilizar `ImageUrlBuilder`.

No implementar lógica de persistencia en el service.

### Controller

Agregar:

`GET /api/franchises/{id:long}`

Debe:

* requerir autenticación;
* no requerir rol Administrator;
* devolver `200` con el DTO;
* devolver `404` para Franchise inexistente o inactiva según la convención existente;
* utilizar el manejo centralizado de excepciones.

## DTO

Crear un DTO específico para Public Web.

No reutilizar `AdminFranchiseDetailDto` si contiene información administrativa.

## Tests

Agregar tests de contrato e integración para verificar:

* endpoint requiere `[Authorize]`;
* endpoint no requiere Administrator;
* no existe `[AllowAnonymous]`;
* DTO no expone campos administrativos;
* Franchise existente devuelve los datos esperados;
* imagen genera URL mediante el mecanismo existente;
* imagen inexistente devuelve `null`;
* datos opcionales ausentes no generan error;
* Franchise inexistente devuelve `404`;
* `id <= 0` genera validación;
* Franchise inactiva no queda expuesta.

## Documentación

Actualizar:

* `project/repositories/repositories-catalog.md`
* `project/services/services-catalog.md`
* `project/endpoints/endpoints-franchises.md`

## Validación

* Build sin errores.
* Tests nuevos completos.
* Suite existente sin regresiones.
* Verificar manualmente:

  * anónimo → `401`;
  * usuario autenticado común → `200`;
  * administrador → `200`.

---

# Resultado de ejecución

## Qué se implementó

`GET /api/franchises/{id}` para la página `/franchises/{id}` del Public Web, con detalle público de Franchise autenticado y sin rol `Administrator`.

Respuesta (`PublicFranchiseDetailDto`):

```json
{
  "id": 3,
  "name": "X-Men",
  "description": "Mutants with the X-gene and their conflicts.",
  "color": "#FCD202",
  "urlImage": "/images/57"
}
```

## Corrección a la Task: el nombre del DTO administrativo

La Task advertía correctamente que no había que reutilizar el DTO administrativo, pero lo nombraba `AdminFranchiseDetailDto`. Ese tipo no existe. El contrato administrativo real es `FranchiseDetailDto` (`api/Application/DTOs/FranchiseDetailDto.cs`), y efectivamente contiene información administrativa: `PublisherId`, `PublisherName`, `PublisherCountryName`, `ImageId`, `IsFeatured`, `IsOngoing` e `IsActive`. La advertencia de la Task era correcta; solo el nombre estaba equivocado.

Por eso el DTO público se llama `PublicFranchiseDetailDto` y no `FranchiseDetailDto`. El nombre corto ya está ocupado por el contrato administrativo, que sirve a create, update y detail del dashboard. Un test de contrato verifica explícitamente que ambos contratos son tipos distintos y que el administrativo contiene campos que el público no expone, para que una futura unificación accidental rompa la suite.

En `Publisher` (TASK-API-0245) el DTO administrativo se llamaba `AdminPublisherDetailDto`, así que ahí el nombre corto `PublisherDetailDto` sí estaba libre. La diferencia de nombres entre ambos hermanos no es arbitraria: refleja el código existente, no una preferencia.

## Dominio revisado: no falta ningún dato

Se revisó `Domain/Entities/Franchise.cs` antes de escribir código. Los cinco campos del contrato objetivo tienen contraparte real:

| Contrato de la Task | Dominio | Nota |
| --- | --- | --- |
| `Id` | `Franchise.Id` | PK |
| `Name` | `Name` | required |
| `Description` | `Description` | nullable |
| `Color` | `Color` | nullable |
| `UrlImage` | `Image` + `ImageUrlBuilder.ToUrl` | FK opcional |

No se inventó ni se simuló ningún campo. No hay información faltante que reportar.

## Archivos nuevos

- `api/Application/DTOs/PublicFranchiseDetailDto.cs`
- `tests/Infrastructure.Tests/Integration/FranchiseDetailContractTests.cs` (8 tests)
- `tests/Infrastructure.Tests/Integration/FranchiseDetailIntegrationTests.cs` (8 tests)

## Archivos modificados

- `api/Application/Interfaces/IFranchiseRepository.cs` — nueva operación `GetDetailByIdAsync`.
- `api/Infrastructure/Repositories/FranchiseRepository.cs` — `GetDetailByIdAsync` con `AsNoTracking` + `Include` solo de `Image`.
- `api/Application/Interfaces/IFranchiseService.cs` — nueva operación `GetPublicDetailAsync`.
- `api/Application/Services/FranchiseService.cs` — implementación y `using Application.Helpers`.
- `api/Api/Controllers/FranchisesController.cs` — `[HttpGet("{id:long}")] GetById`.
- `project/repositories/repositories-catalog.md` — operación y comportamiento.
- `project/repositories.md` — conteo de `FranchiseRepository` 4 → 5.
- `project/services/services-catalog.md` — operación y comportamiento.
- `project/endpoints/endpoints-franchises.md` — sección del detalle público.

## Decisiones

### Repository: solo `Image`

A diferencia de Publisher, el detalle público de Franchise no expone país ni editorial, así que la única navegación necesaria es `Image`. La consulta carga solo eso: `AsNoTracking`, una ida y vuelta, sin N+1 y sin el grafo completo. La consulta paginada sí carga `Publisher`, `Publisher.Country` e `Image`, porque el listado público devuelve `PublisherId` y `PublisherName`; el detalle no los necesita.

`GetByIdAsync` es el read del camino de escritura (lo usan update/deactivate/activate, que mutan la entidad) y mantiene change tracking. Se agregó `GetDetailByIdAsync` como lectura pura, con el mismo criterio que en TASK-API-0245. El nombre no lleva "public": el Repository no debe conocer la audiencia.

### Editorial fuera del payload

El contrato de la Task lista cinco campos y no incluye la editorial. Se respetó el alcance. La información no está inaccesible: `GET /api/franchises` ya devuelve `PublisherId` y `PublisherName` en cada ítem, así que el frontend puede resolverla sin una llamada extra. Queda anotado en `endpoints-franchises.md` para que Public Web no lo busque en el detalle.

### Franchise inactiva

Por decisión humana previa, una franchise con `IsActive = false` responde `404`, con el mismo mensaje que un id inexistente para no revelar la existencia de un recurso desactivado. Es la convención ya aplicada en el detalle de Publisher.

## Tests

`FranchiseDetailContractTests` (8) — `FranchisesController` requiere `[Authorize]`, sin `AllowAnonymous` ni `Roles`; expone `GetById` en `api/franchises/{id:long}` con `(long id, CancellationToken)` y retorno `Task<IActionResult>`; la acción no es anónima; el DTO expone exactamente los cinco campos públicos; no expone `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt`, `PublisherId`, `ImageId`, `StoragePath` ni `FileName`; la URL de imagen sale del mecanismo de imágenes del proyecto; una imagen nula produce URL nula; y el contrato público es un tipo distinto del administrativo, con campos que este último tiene y el primero no.

`FranchiseDetailIntegrationTests` (8), data-driven sobre la base de desarrollo, sin crear ni eliminar datos:

| Test | Cubre |
| --- | --- |
| `GetPublicDetail_ExistingFranchise_ReturnsItsPublicData` | nombre, description y color coinciden con la entidad |
| `GetPublicDetail_ExposesImageUrlWhenImageExists` | `urlImage` es `/images/{id}` cuando hay imagen, y null cuando no |
| `GetPublicDetail_MissingImage_ReturnsNullUrlImage` | toda franchise sin imagen devuelve `urlImage: null` |
| `GetPublicDetail_OptionalDataCanBeAbsent` | datos opcionales ausentes no lanzan excepción y quedan en null |
| `GetPublicDetail_UnknownFranchise_ThrowsNotFound` | id inexistente produce `BusinessNotFoundException` |
| `GetPublicDetail_NonPositiveId_ThrowsValidation` | `0` e id negativo producen `ValidationException` |
| `GetPublicDetail_InactiveFranchise_ThrowsNotFound` | toda franchise inactiva produce `BusinessNotFoundException` |
| `GetPublicDetail_DoesNotExposeAdministrativeFields` | el contrato no filtra datos administrativos |

El caso de imagen ausente se cubre dos veces: de forma data-driven sobre la base, y de forma determinista en el contrato con `ImageUrlBuilder.ToUrl(null)`, para que el test no quede vacío si los datos de desarrollo no tienen ninguna franchise sin imagen.

## Verificación

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores, 0 advertencias**.
- Tests nuevos: **16/16 en verde**.
- Suite completa: **162/162 en verde** (146 previos + 16 nuevos).

Nota de proceso: el primer build falló con `MSB3021`/`MSB3027` por DLLs bloqueadas por una instancia de la API en ejecución (PID 35260). No eran errores de compilación. El proceso terminó por sí solo y el rebuild dio 0 errores.

## Verificación pendiente de ejecución manual

Por decisión humana previa, la seguridad se valida por contrato de atributos y no por llamada HTTP, ya que el proyecto de tests no monta la API con `WebApplicationFactory`. Queda para prueba manual contra la API en ejecución:

1. Usuario anónimo a `GET /api/franchises/{id}` → 401.
2. Usuario autenticado sin rol Administrator → 200.
3. Usuario autenticado con rol Administrator → 200.
4. Id inexistente → 404 con el mensaje estándar.

## Criterios de aceptación

Endpoint: existe `GET /api/franchises/{id}`, requiere autenticación, no requiere `Administrator`, no admite anónimos y usa las convenciones existentes (`[Authorize]` sin roles en `FranchisesController`, que no tiene `[AllowAnonymous]`).

Datos: la respuesta construye el header de Franchise; devuelve nombre, description, color e imagen cuando existen; los opcionales pueden estar ausentes; imagen ausente devuelve `null`.

Arquitectura: Repository, Service y Endpoint respetan responsabilidades; no se expone ninguna entidad de persistencia, dato administrativo ni información de almacenamiento; no hay N+1; se reutilizaron `IFranchiseService`, `IFranchiseRepository` e `ImageUrlBuilder`.

Documentación y pruebas: `repositories-catalog.md`, `services-catalog.md` y `endpoints-franchises.md` actualizados, con el endpoint identificado explícitamente como Public Web autenticado; `repositories.md` con el conteo corregido; 16 tests nuevos; build y suite completa en verde. No se modificó funcionalidad fuera del alcance.
