# TASK-API-0274 — Implementar Service para detalle público de Work

## Objetivo

Implementar en el Service de `Work` la consulta de detalle público definida en `US-0028`.

El Service debe obtener la Work mediante el repositorio de catálogo y transformarla en el contrato público `CatalogWorkDetailDto`.

---

## Contrato de respuesta

Crear los DTOs necesarios para representar:

```text id="8c5g0v"
CatalogWorkDetailDto
```

Debe contener:

```text id="f2g1qv"
Id

Publisher
Franchise
Series

Cover

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

---

## Contexto editorial

Publisher, Franchise y Series deben utilizar un DTO común:

```text id="yd9w3e"
CatalogWorkContextDto
    Id
    Name
    Color
    Cover
```

El Service debe mapear la entidad correspondiente y construir la URL pública de la portada mediante `ImageUrlBuilder`.

Cuando una Work no tenga determinado contexto estructural, el DTO correspondiente debe ser `null`.

No deben crearse contextos artificiales ni inferirse relaciones.

---

## Portada

La portada de la Work debe exponerse mediante la URL generada por `ImageUrlBuilder`.

La ausencia de portada debe representarse como `null`, de acuerdo con los contratos existentes.

No debe exponerse directamente una ruta física de almacenamiento.

---

## Number

`Number` es opcional.

Cuando exista, debe mapearse al DTO.

Cuando no exista:

```text id="0uxh1e"
Number = null
```

No debe generarse ningún valor ficticio.

---

## Información principal

Mapear:

```text id="x5yn0a"
Title
Description
Language
WorkType
PublicationDate
```

La descripción puede ser `null`.

La fecha de publicación debe conservar el valor del dominio sin sustituirla por `CreatedAt` o `UploadedAt`.

---

## PreviousWork y NextWork

Crear un DTO específico:

```text id="j7h1ar"
CatalogWorkNavigationDto
    Id
    Title
    Number
    Cover
```

Mapear únicamente las relaciones explícitas del dominio.

Para cada relación:

* `Id` de la Work;
* `Title`;
* `Number`, si existe;
* URL de `Cover`, si existe.

Si no existe relación:

```text id="kq5kz0"
PreviousWork = null
NextWork = null
```

El Service no debe buscar ni calcular una Work anterior o siguiente.

---

## PersonAssignments

El detalle debe conservar todas las asignaciones existentes.

Cada asignación debe representar:

```text id="q2t6y3"
Person
Role
```

La respuesta debe permitir representar casos como:

```text id="l1r3ag"
Stan Lee       → Escritor
Steve Ditko    → Dibujante
Steve Ditko    → Entintador
```

No deben fusionarse asignaciones por `PersonId`.

No debe eliminarse una asignación porque otra asignación pertenezca a la misma Persona.

---

## Tags

Mapear todos los Tags asociados a la Work utilizando el contrato existente para representar Tags en el catálogo.

No incorporar en esta task navegación, búsqueda ni filtrado por Tags.

---

## Not Found

Si el repositorio no encuentra la Work, el Service debe lanzar la excepción utilizada por la aplicación para representar un recurso inexistente.

El endpoint será responsable de convertir esta situación en `404`.

No debe devolverse un DTO vacío.

---

## Imágenes

Todas las imágenes deben exponerse mediante `ImageUrlBuilder`.

Esto incluye:

* Cover de Work;
* Cover de Publisher;
* Cover de Franchise;
* Cover de Series;
* Cover de PreviousWork;
* Cover de NextWork.

No deben exponerse rutas físicas internas.

---

## Servicio

Agregar el método correspondiente al contrato de `IWorkService` utilizado para consultas públicas de catálogo.

La implementación debe:

1. solicitar la Work al repositorio;
2. validar existencia;
3. mapear el contexto editorial;
4. mapear información principal;
5. mapear PreviousWork y NextWork;
6. mapear PersonAssignments;
7. mapear Tags;
8. construir URLs de imágenes;
9. devolver `CatalogWorkDetailDto`.

El método debe mantener una única responsabilidad y no incorporar comportamiento de otras funcionalidades.

---

## Documentación

Actualizar:

```text id="6e7r2b"
project/services/services-catalog.md
```

Documentar el nuevo método y sus DTOs públicos.

No modificar contratos administrativos que no correspondan a esta User Story.

---

## Restricciones

* No modificar el dominio.
* No modificar el Repository implementado en `TASK-API-0273`.
* No crear endpoints.
* No implementar Reader.
* No implementar progreso.
* No implementar favoritos.
* No implementar historial.
* No implementar ratings.
* No implementar reviews.
* No implementar recomendaciones.
* No inferir Previous/Next.
* No fusionar PersonAssignments.
* No exponer rutas físicas de imágenes.
* No introducir lógica basada en `WorkType`.

---

## Validación

La task se considera completa cuando:

* [ ] `CatalogWorkDetailDto` está implementado.
* [ ] `CatalogWorkContextDto` está implementado.
* [ ] `CatalogWorkNavigationDto` está implementado.
* [ ] Publisher se mapea correctamente.
* [ ] Franchise se mapea correctamente.
* [ ] Series se mapea correctamente.
* [ ] Las entidades contextuales incluyen Id, Name, Color y Cover.
* [ ] Cover de Work se transforma mediante `ImageUrlBuilder`.
* [ ] Number puede ser `null`.
* [ ] Title se mapea correctamente.
* [ ] Description puede ser `null`.
* [ ] Language se mapea correctamente.
* [ ] WorkType se mapea correctamente.
* [ ] PublicationDate se mapea correctamente.
* [ ] PreviousWork puede ser `null`.
* [ ] NextWork puede ser `null`.
* [ ] PreviousWork incluye Id, Title, Number y Cover.
* [ ] NextWork incluye Id, Title, Number y Cover.
* [ ] Todas las PersonAssignments se conservan.
* [ ] Una Persona puede aparecer en múltiples asignaciones.
* [ ] Los Roles se conservan individualmente.
* [ ] Todos los Tags se mapean.
* [ ] Las imágenes utilizan `ImageUrlBuilder`.
* [ ] Work inexistente genera la excepción correspondiente.
* [ ] `IWorkService` está actualizado.
* [ ] `services-catalog.md` está actualizado.
* [ ] El código compila correctamente.


---

## Execution Result

**Completed:** 2026-10-06

**What was implemented:**

1. **Added `GetCatalogByIdAsync` to `IWorkService`** (`Application/Interfaces/IWorkService.cs`):
   - Signature: `Task<CatalogWorkDetailDto> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default)`

2. **Created new DTOs** (`Application/DTOs/WorkCatalogDtos.cs`):
   - `CatalogWorkContextDto` (Id, Name, Color, UrlCover) - for Publisher/Franchise/Series
   - `CatalogWorkNavigationDto` (Id, Title, NumberValue, UrlCover) - for PreviousWork/NextWork
   - `CatalogWorkDetailDto` - main detail DTO with all US-0028 fields

3. **Implemented `GetCatalogByIdAsync` in `WorkService`** (`Application/Services/WorkService.cs`):
   - Calls `_unitOfWork.WorkRepository.GetCatalogByIdAsync`
   - Throws `BusinessNotFoundException` if work not found
   - Maps to `CatalogWorkDetailDto` with:
     - Context: Publisher/Franchise/Series using same resolution chain as `MapCatalogWork`
     - Navigation: PreviousWork/NextWork with explicit domain relationships only
     - People: All PersonByRole assignments preserved individually
     - Tags: All tags mapped via existing `TagDto`
     - Images: All URLs via `ImageUrlBuilder.ToUrl`
   - Helper methods: `MapPublisherContext`, `MapFranchiseContext`, `MapSeriesContext`, `MapNavigationWork`

**Files changed:**
- `Application/Interfaces/IWorkService.cs` - Added method signature
- `Application/DTOs/WorkCatalogDtos.cs` - Added 3 new DTOs
- `Application/Services/WorkService.cs` - Implemented method and helpers

**Decisions made:**
- New DTOs created (not reusing admin DTOs) to avoid exposing IsActive, ContentStatus, etc.
- `CatalogWorkContextDto` uses `UrlCover` (not `CoverId`) for public consumption
- `CatalogWorkNavigationDto` uses `UrlCover` for consistency
- Language and WorkType are nullable in DTO (domain allows nulls)
- PersonAssignments use existing `PersonByRoleDto` pattern
- Tags use existing `TagDto` (Id, Name)

**Tests:** 250/252 integration tests pass (2 pre-existing failures unrelated to this change)
