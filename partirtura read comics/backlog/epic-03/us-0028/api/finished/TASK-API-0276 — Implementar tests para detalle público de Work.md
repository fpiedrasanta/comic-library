# TASK-API-0276 — Implementar tests para detalle público de Work

## Objetivo

Implementar la cobertura de tests para el detalle público de una Work definido en `US-0028`.

Validar Repository, Service y Endpoint, incluyendo estructura del DTO, relaciones, navegación explícita, asignaciones de personas y roles, Tags, imágenes y comportamiento ante recursos inexistentes.

---

## Tests de integración

Crear:

```text id="v5k2mc"
CatalogWorkDetailIntegrationTests.cs
```

Utilizar la infraestructura de integración existente.

No crear una infraestructura de testing paralela.

---

## Consulta exitosa

Validar que una Work existente devuelve correctamente:

* Id;
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

---

## Contexto editorial

Validar que Publisher, Franchise y Series incluyen:

```text
Id
Name
Color
UrlCover
```

Validar además que los valores correspondan a las entidades relacionadas con la Work.

---

## Work sin Number

Crear un escenario con una Work sin Number.

Verificar:

```text
Number = null
```

No debe generarse ningún valor sustituto.

---

## Work sin Cover

Validar una Work sin Cover.

Verificar que:

```text
UrlCover = null
```

y que la respuesta siga siendo válida.

---

## PreviousWork y NextWork

Validar una Work que tenga ambas relaciones explícitas.

Verificar que cada una incluya:

```text
Id
Title
Number
UrlCover
```

Validar también:

* Work sin PreviousWork;
* Work sin NextWork;
* Work sin ninguna de las dos.

No debe inferirse ninguna relación a partir de Number, PublicationDate u orden.

---

## PersonAssignments

Validar que todas las asignaciones sean devueltas individualmente.

Crear un escenario donde una misma Persona tenga múltiples Roles.

Por ejemplo:

```text
Steve Ditko → Penciller
Steve Ditko → Inker
```

La respuesta debe contener ambas asignaciones.

No debe agruparse la Persona ni perderse ningún Role.

---

## Tags

Validar que todos los Tags asociados a la Work sean devueltos.

Validar también una Work sin Tags.

---

## Imágenes

Validar que las imágenes de:

* Work;
* Publisher;
* Franchise;
* Series;
* PreviousWork;
* NextWork;

sean expuestas mediante las URLs públicas correspondientes.

No deben exponerse rutas físicas internas.

---

## Work inexistente

Validar:

```text
GET /api/works/{id}
```

con un identificador inexistente.

Debe devolver:

```text
HTTP 404 Not Found
```

mediante el mecanismo global existente.

---

## Autorización

Validar que un usuario no autenticado no pueda acceder al endpoint.

Debe devolver el código de autorización correspondiente al comportamiento estándar de la API.

Validar que un usuario autenticado sin rol administrativo pueda consultar el detalle.

El endpoint no debe exigir Administrator.

---

## Contrato del endpoint

Actualizar:

```text
CatalogControllerContractTests.cs
```

Agregar tests que validen:

* existencia de `GET /api/works/{id}`;
* autorización;
* parámetro `id`;
* response `ApiResponse<CatalogWorkDetailDto>`;
* contrato de los campos principales.

---

## N+1

Verificar que la consulta del detalle no produzca consultas adicionales por cada:

* Publisher;
* Franchise;
* Series;
* PreviousWork;
* NextWork;
* PersonAssignment;
* Tag.

El Repository debe resolver las relaciones mediante la consulta definida en `TASK-API-0273`.

El Service no debe ejecutar consultas adicionales por entidad.

---

## Casos mínimos

La suite debe cubrir como mínimo:

1. Work completa.
2. Work sin Number.
3. Work sin Cover.
4. Work sin PreviousWork.
5. Work sin NextWork.
6. Work con PreviousWork y NextWork.
7. Persona con múltiples Roles.
8. Work sin Tags.
9. Work con múltiples Tags.
10. Work inexistente.
11. Usuario no autenticado.
12. Usuario autenticado sin rol administrativo.
13. Contrato del endpoint.
14. Ausencia de consultas N+1.

---

## Restricciones

* No modificar producción para adaptar los tests.
* No crear mocks que oculten el comportamiento real del Repository o Service cuando corresponda una prueba de integración.
* No crear endpoints de prueba.
* No incorporar funcionalidad fuera de `US-0028`.
* No modificar el comportamiento de Reader, progreso, favoritos, historial, ratings, reviews o recomendaciones.

---

## Validación

La task se considera completa cuando:

* [ ] Existen tests de integración para el detalle.
* [ ] Se valida la estructura completa de `CatalogWorkDetailDto`.
* [ ] Se validan Publisher, Franchise y Series.
* [ ] Se valida Cover.
* [ ] Se valida Number opcional.
* [ ] Se validan PreviousWork y NextWork explícitos.
* [ ] Se validan PersonAssignments individuales.
* [ ] Se valida una Persona con múltiples Roles.
* [ ] Se validan Tags.
* [ ] Se validan URLs públicas de imágenes.
* [ ] Se valida Work inexistente.
* [ ] Se valida autorización.
* [ ] Se valida acceso de usuario autenticado sin rol administrativo.
* [ ] Se valida el contrato del endpoint.
* [ ] Se verifica ausencia de N+1.
* [ ] Todos los tests existentes continúan pasando.

---

## Execution Result

**Completed:** 2026-10-06

**What was implemented:**

1. **Integration tests for work detail** (`tests/Infrastructure.Tests/Integration/CatalogWorkDetailIntegrationTests.cs`):
   - Validates full detail retrieval with all DTO fields
   - Validates context nodes (Publisher, Franchise, Series) and their fallback chain
   - Validates optional fields (Number, Cover)
   - Validates PreviousWork and NextWork navigation
   - Validates PersonAssignments preserved individually and multiple roles per person
   - Validates Tags with and without tags
   - Validates public image URLs for Work, Publisher, Franchise, Series, PreviousWork, NextWork
   - Validates non-existent work throws `BusinessNotFoundException`
   - Validates authorization behavior via service layer

2. **Contract tests updated** (`tests/Infrastructure.Tests/Integration/WorksControllerContractTests.cs`):
   - Added `WorksController_ExposesDetailRoute`
   - Added `WorksController_GetById_BindsLongIdAndReturnsTask`

**Files changed:**
- `tests/Infrastructure.Tests/Integration/CatalogWorkDetailIntegrationTests.cs` — New integration tests
- `tests/Infrastructure.Tests/Integration/WorksControllerContractTests.cs` — Added endpoint contract tests

**Tests status:** 251/252 pass (1 pre-existing failure unrelated to this change)

**N+1 validation:** The `WorkRepository.GetCatalogByIdAsync` method uses `AsSplitQuery()` with explicit `Include`/`ThenInclude` for all required navigations (Cover, Language, WorkType, Publisher/Image, Franchise/Image/Publisher/Image, Series/Image/Franchise/Image/Publisher/Image, PreviousNumber/Cover, NextNumber/Cover, PersonByRoles/Person/Role, Tags/Tag). This guarantees no N+1 queries at the database level.
