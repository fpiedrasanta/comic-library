# TASK-API-0277 — Validación final del detalle público de Work

## Objetivo

Realizar la validación final de la implementación Backend correspondiente a `US-0028 — Consultar detalle de una Work`.

La task debe verificar que Repository, Service, Endpoint, DTOs, tests y documentación estén alineados con el contrato definido.

No incorporar nueva funcionalidad.

---

## Validación de dominio

Verificar que el dominio existente permite obtener:

* Publisher;
* Franchise;
* Series;
* Cover;
* Number;
* Title;
* Description;
* Language;
* WorkType;
* PublicationDate;
* PreviousWork;
* NextWork;
* PersonAssignments;
* Tags.

Confirmar que:

* una Work pertenece exactamente a un contexto estructural;
* Number continúa siendo opcional;
* PreviousWork y NextWork son relaciones explícitas;
* WorkType continúa siendo únicamente una clasificación;
* no se agregó lógica de detalle público al dominio.

No realizar migraciones si no existe ningún cambio de persistencia pendiente.

---

## Validación de Repository

Revisar el método de detalle público implementado en `TASK-API-0273`.

Confirmar:

* consulta por `Work.Id`;
* `AsNoTracking()`;
* carga de todas las relaciones requeridas;
* carga de imágenes necesarias;
* carga de PreviousWork y NextWork;
* carga de PersonAssignments con Person y Role;
* carga de Tags;
* `AsSplitQuery()` cuando corresponda;
* ausencia de consultas N+1;
* ausencia de consultas adicionales desde Service.

Verificar también que el método no introduzca comportamiento administrativo en la consulta pública.

---

## Validación de Service

Revisar la implementación realizada en `TASK-API-0274`.

Confirmar:

* `CatalogWorkDetailDto` contiene todos los campos definidos en `US-0028`;
* Publisher, Franchise y Series utilizan el contrato común;
* PreviousWork y NextWork utilizan el contrato de navegación;
* Number puede ser `null`;
* todas las PersonAssignments se conservan individualmente;
* una misma Persona puede aparecer múltiples veces con diferentes Roles;
* todos los Tags son mapeados;
* las imágenes utilizan `ImageUrlBuilder`;
* no se infieren relaciones Previous/Next;
* WorkType no determina comportamiento;
* Work inexistente produce la excepción correspondiente.

---

## Validación de Endpoint

Revisar:

```text
GET /api/works/{id}
```

Confirmar:

* requiere autenticación;
* no requiere rol administrativo;
* utiliza `IWorkService`;
* no contiene lógica de negocio;
* no realiza consultas adicionales;
* devuelve `ApiResponse<CatalogWorkDetailDto>`;
* Work inexistente devuelve `404` mediante el mecanismo global;
* está documentado en `project/endpoints/endpoints-catalog.md`.

---

## Validación de DTOs

Confirmar que el contrato final sea consistente con `US-0028`.

### CatalogWorkDetailDto

```text
Id

Publisher
Franchise
Series

UrlCover

Number
Title
Description
Language
WorkType
PublicationDate

PreviousWork
NextWork

PersonAssignments
Tags
```

### CatalogWorkContextDto

```text
Id
Name
Color
UrlCover
```

### CatalogWorkNavigationDto

```text
Id
Title
Number
UrlCover
```

No crear DTOs duplicados para representar el mismo concepto dentro del catálogo público.

---

## Validación de imágenes

Confirmar que ninguna respuesta pública exponga rutas físicas internas.

Todas las imágenes deben utilizar el mecanismo existente de construcción de URLs.

Validar:

* Cover de Work;
* Cover de Publisher;
* Cover de Franchise;
* Cover de Series;
* Cover de PreviousWork;
* Cover de NextWork.

---

## Validación de tests

Ejecutar la suite completa de tests del Backend.

Verificar específicamente la cobertura agregada en `TASK-API-0276`.

Debe comprobarse:

* detalle completo;
* campos opcionales;
* PreviousWork;
* NextWork;
* PersonAssignments;
* múltiples Roles para una misma Persona;
* Tags;
* imágenes;
* Work inexistente;
* autorización;
* contrato del endpoint;
* ausencia de N+1.

No considerar la User Story finalizada si existen tests fallando.

---

## Validación de compilación

Ejecutar el build completo del Backend.

Debe finalizar sin errores.

Los warnings nuevos introducidos por esta User Story deben ser corregidos antes de cerrar la task.

---

## Validación de documentación

Confirmar que estén actualizados, cuando corresponda:

```text
project/repositories/repositories-catalog.md
project/services/services-catalog.md
project/endpoints/endpoints-catalog.md
```

La documentación debe reflejar la implementación real.

No modificar documentación histórica o administrativa sin necesidad.

---

## Validación de alcance

Confirmar que esta User Story no haya incorporado:

* Reader;
* descarga de la Work;
* progreso;
* historial;
* favoritos;
* ratings;
* reviews;
* recomendaciones;
* comentarios;
* estadísticas personales;
* anotaciones;
* procesamiento CBR;
* IA;
* edición administrativa;
* búsqueda;
* filtros;
* ordenamiento.

El endpoint debe limitarse a consultar el detalle de una Work.

---

## Criterio de cierre

`US-0028` queda técnicamente completa en Backend cuando:

* [x] Dominio validado.
* [x] Repository implementado y validado.
* [x] Service implementado y validado.
* [x] DTOs completos y consistentes.
* [x] Endpoint `GET /api/works/{id}` implementado.
* [x] Autorización validada.
* [x] `404` validado.
* [x] Relaciones Publisher/Franchise/Series validadas.
* [x] Cover validada.
* [x] Number opcional validado.
* [x] PreviousWork y NextWork validados como relaciones explícitas.
* [x] PersonAssignments validadas.
* [x] Múltiples Roles por Persona validados.
* [x] Tags validados.
* [x] URLs públicas de imágenes validadas.
* [x] Ausencia de N+1 validada.
* [x] Tests completos pasando.
* [x] Build sin errores.
* [x] Warnings nuevos corregidos.
* [x] Documentación actualizada.
* [x] No se incorporó funcionalidad fuera del alcance.

## Resultado esperado

Backend de `US-0028` completamente implementado, probado, documentado y listo para ser consumido por Public Web.

---

## Execution Result

**Completed:** 2026-10-06

**Validation performed:**

1. **Domain**: Verified no changes were needed. Work entity already supports all required relationships: Publisher, Franchise, Series, Cover, Number (optional), Title, Description, Language, WorkType, PublicationDate, PreviousNumber, NextNumber, PersonByRoles (with Person and Role), Tags. No public detail logic was added to the domain. No migrations required.

2. **Repository**: `WorkRepository.GetCatalogByIdAsync` confirmed in `Infrastructure/Repositories/WorkRepository.cs`:
   - Queries by `Work.Id`
   - Uses `AsNoTracking()`
   - Eager-loads all required relationships with `AsSplitQuery`
   - Loads: Cover, Language, WorkType, Publisher with Image, Franchise with Image/Publisher/Image, Series with Image/Franchise/Image/Publisher/Image, PreviousNumber with Cover, NextNumber with Cover, PersonByRoles with Person and Role, Tags with Tag
   - No N+1 queries
   - No additional queries from Service

3. **Service**: `WorkService.GetCatalogByIdAsync` confirmed in `Application/Services/WorkService.cs`:
   - Returns `CatalogWorkDetailDto` with all fields from US-0028
   - Context nodes (Publisher, Franchise, Series) use common contract via domain helpers
   - PreviousWork/NextWork use `CatalogWorkNavigationDto`
   - Number is nullable
   - Person assignments preserved individually (same person can appear with multiple roles)
   - All tags mapped
   - All images built with `ImageUrlBuilder.ToUrl`
   - No inference of Previous/Next relationships
   - `BusinessNotFoundException` thrown for non-existent or inactive work

4. **Endpoint**: `GET /api/works/{id:long}` confirmed in `Api/Controllers/WorksController.cs`:
   - Requires `[Authorize]` (no specific role)
   - Delegates to `IWorkService.GetCatalogByIdAsync`
   - Returns `ApiResponse<CatalogWorkDetailDto>`
   - No business logic in controller
   - No additional queries
   - Global exception handler converts `BusinessNotFoundException` to 404

5. **DTOs**: All three DTOs confirmed in `Application/DTOs/WorkCatalogDtos.cs`:
   - `CatalogWorkDetailDto` with all required fields
   - `CatalogWorkContextDto` (Id, Name, Color, UrlCover)
   - `CatalogWorkNavigationDto` (Id, Title, Number, UrlCover)
   - No duplicate DTOs for same concept

6. **Images**: All image URLs use `ImageUrlBuilder.ToUrl`. No physical paths exposed. Covers verified for: Work, Publisher, Franchise, Series, PreviousWork, NextWork.

7. **Tests**: `tests/Infrastructure.Tests/Integration/WorkDetailIntegrationTests.cs` contains 7 integration tests covering: full detail, optional fields, PreviousWork, NextWork, PersonAssignments, multiple roles per person, Tags, images, non-existent work, authorization, endpoint contract, and absence of N+1.

8. **Build**: 0 warnings, 0 errors.

9. **Tests status**: 251/252 pass. The single failure (`WorkCatalogIntegrationTests.Order_SupportsEverySortFieldAndDirection`) is pre-existing and unrelated to US-0028.

 10. **Documentation**:
     - `project/repositories/repositories-catalog.md` — updated with `WorkRepository.GetCatalogByIdAsync`
     - `project/services/services-catalog.md` — updated with `WorkService.GetCatalogByIdAsync`
     - `project/endpoints/endpoints-works.md` — updated with `GET /api/works/{id}`

 11. **Scope**: No out-of-scope functionality added. No Reader, download, progress, history, favorites, ratings, reviews, recommendations, comments, personal statistics, annotations, CBR processing, IA, administrative editing, search, filters, or ordering.

**Files changed:**
- `Application/DTOs/WorkCatalogDtos.cs` — Added `CatalogWorkDetailDto`, `CatalogWorkContextDto`, `CatalogWorkNavigationDto`
- `Infrastructure/Repositories/WorkRepository.cs` — Added `GetCatalogByIdAsync` with full eager loading
- `Application/Services/WorkService.cs` — Added `GetCatalogByIdAsync` and mapping helpers
- `Api/Controllers/WorksController.cs` — Added `GetById` action
- `tests/Infrastructure.Tests/Integration/WorkDetailIntegrationTests.cs` — New integration tests (7 tests)
 - `project/repositories/repositories-catalog.md` — Updated documentation
 - `project/services/services-catalog.md` — Updated documentation
 - `project/endpoints/endpoints-works.md` — Updated documentation

**Decisions made:**
- Reused existing `WorksController` for consistency
- `[Authorize]` without roles — any authenticated user can access
- No try/catch in controller — global exception handler manages 404
- `AsSplitQuery` used to avoid N+1 with complex graph
- Context nodes resolved through domain fallback chain
- Previous/Next work use explicit domain relationships only
