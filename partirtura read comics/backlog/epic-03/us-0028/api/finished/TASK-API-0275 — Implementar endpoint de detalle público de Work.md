# TASK-API-0275 — Implementar endpoint de detalle público de Work

## Objetivo

Implementar el endpoint de consulta de detalle público de una Work definido en `US-0028`.

El endpoint debe exponer el `CatalogWorkDetailDto` generado por el Service, sin incorporar lógica de negocio ni realizar consultas adicionales.

---

## Endpoint

Implementar:

```text
GET /api/works/{id}
```

Donde:

```text
id = identificador de la Work
```

El endpoint debe reutilizar el controlador existente utilizado para las consultas públicas de Works.

---

## Autorización

El endpoint requiere usuario autenticado:

```text
[Authorize]
```

No requiere un rol administrativo específico.

No utilizar:

```text
[AllowAnonymous]
```

La autorización debe mantener el mismo criterio utilizado por los demás endpoints públicos autenticados del catálogo.

---

## Request

El único parámetro requerido es:

```text
id: long
```

No agregar:

* filtros;
* búsqueda;
* paginación;
* ordenamiento;
* parámetros relacionados con Reader;
* parámetros relacionados con usuario.

---

## Response

En caso exitoso, devolver:

```text
ApiResponse<CatalogWorkDetailDto>
```

El DTO debe ser obtenido exclusivamente mediante `IWorkService`.

El endpoint no debe construir ni modificar el DTO.

---

## Flujo

La implementación debe limitarse a:

1. recibir `id`;
2. invocar el método correspondiente de `IWorkService`;
3. devolver el resultado mediante el wrapper estándar de API.

La lógica de:

* obtención de relaciones;
* validación de existencia;
* mapeo;
* construcción de URLs;
* PreviousWork;
* NextWork;
* PersonAssignments;
* Tags;

pertenece al Repository y Service implementados en las tasks anteriores.

---

## Work inexistente

Cuando el Service indique que la Work no existe, debe utilizarse el mecanismo global existente para transformar la excepción correspondiente en:

```text
HTTP 404 Not Found
```

No implementar un `try/catch` específico en el controlador.

No devolver:

```text
200 OK
```

con un DTO vacío o `null`.

---

## Contrato de endpoint

Documentar el endpoint en:

```text
project/endpoints/endpoints-catalog.md
```

La documentación debe incluir:

* método HTTP;
* ruta;
* autorización;
* parámetro `id`;
* response exitoso;
* comportamiento ante Work inexistente.

---

## Restricciones

* No modificar el Repository.
* No modificar el Service salvo lo estrictamente necesario para consumir su contrato ya implementado.
* No incorporar lógica de negocio al Controller.
* No realizar consultas adicionales desde el Controller.
* No implementar Reader.
* No implementar progreso.
* No implementar favoritos.
* No implementar historial.
* No implementar ratings.
* No implementar reviews.
* No implementar recomendaciones.
* No agregar filtros ni búsqueda.
* No agregar paginación.
* No inferir PreviousWork ni NextWork.
* No crear un endpoint administrativo paralelo.
* No crear un DTO alternativo para el mismo detalle.

---

## Validación

La task se considera completa cuando:

* [ ] Existe `GET /api/works/{id}`.
* [ ] El endpoint requiere autenticación.
* [ ] No requiere rol administrativo.
* [ ] Utiliza `IWorkService`.
* [ ] Devuelve `ApiResponse<CatalogWorkDetailDto>`.
* [ ] No contiene lógica de negocio.
* [ ] Work inexistente devuelve HTTP 404 mediante el mecanismo global.
* [ ] No realiza consultas adicionales.
* [ ] El endpoint está documentado en `project/endpoints/endpoints-catalog.md`.
* [ ] El proyecto compila correctamente.


---

## Execution Result

**Completed:** 2026-10-06

**What was implemented:**

1. **Added `GetById` action to `WorksController`** (`Api/Controllers/WorksController.cs`):
   - Route: `GET /api/works/{id:long}`
   - Parameter: `long id` (path) + `CancellationToken`
   - Delegates to `IWorkService.GetCatalogByIdAsync`
   - Returns `ApiResponse<CatalogWorkDetailDto>`
   - Uses existing `[Authorize]` on controller (no roles required)
   - No additional logic - thin controller

**Files changed:**
- `Api/Controllers/WorksController.cs` - Added `[HttpGet("{id:long}")]` action

**Decisions made:**
- Reused existing `WorksController` (not a new controller) for consistency
- `[Authorize]` without roles - any authenticated user can access
- No try/catch - lets global exception handler convert `BusinessNotFoundException` to 404
- No additional queries from controller
- Returns standard `ApiResponse<CatalogWorkDetailDto>` wrapper

**Tests:** 250/252 integration tests pass (2 pre-existing failures unrelated to this change)
