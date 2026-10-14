# TASK-API-0240 — Implementar endpoint GET de catálogo de Works

## Objetivo

Exponer mediante HTTP la consulta del catálogo de Works para usuarios registrados, utilizando la operación de `WorkService` implementada en `TASK-API-0239`.

---

## Dependencias

* `TASK-API-0239` — Implementar consulta de catálogo de Works en Service.

---

## Contexto obligatorio

Antes de implementar:

* leer `project/endpoints.md`;

---

## Endpoint

Crear un endpoint HTTP GET para el catálogo de Works.

Ruta base propuesta:

```text
GET /api/works
```

Debe respetar las convenciones existentes del proyecto para endpoints de lectura de usuarios autenticados.

Acceso:

```text
Usuario autenticado
```

No requiere rol Administrator.

---

## Query parameters

El endpoint debe aceptar los parámetros necesarios para:

```text
search
publisherId
franchiseId
seriesId
workTypeId
sort
direction
pageNumber
pageSize
```

Los nombres definitivos deben respetar las convenciones existentes del proyecto.

Valores por defecto:

```text
sort = UploadedAt
direction = Descending
```

---

## Respuesta

La respuesta debe utilizar el wrapper y estructura paginada estándar del proyecto.

Cada Work debe exponer la información necesaria para la pantalla de catálogo, incluyendo como mínimo:

* Id;
* WorkType;
* Title;
* Number.Value cuando exista;
* PublicationDate;
* UploadedAt;
* Publisher;
* Franchise;
* Series;
* información visual necesaria para la portada;
* colores configurados de Publisher, Franchise y Series.

El contrato definitivo de DTO debe respetar las convenciones existentes y evitar exponer entidades de dominio directamente.

---

## Seguridad

El endpoint debe estar protegido para usuarios autenticados.

No debe estar disponible para usuarios anónimos.

No debe requerir Administrator.

No debe devolver información administrativa ni datos internos de procesamiento que no sean necesarios para la navegación pública.

---

## Comportamiento

El endpoint debe delegar la operación al `IWorkService`.

No debe contener:

* consultas EF Core;
* lógica de filtrado;
* lógica de búsqueda;
* lógica de jerarquía Publisher → Franchise → Series;
* lógica de mapeo compleja que corresponda al Service.

El Controller debe limitarse a recibir la solicitud, delegar y devolver la respuesta según las convenciones del proyecto.

---

## Documentación

Leer:

```text
project/endpoints.md
```

Actualizar:

```text
project/endpoints.md
```

y la documentación específica de endpoints de Work si existe.

Documentar:

* ruta;
* método;
* autenticación;
* query parameters;
* valores por defecto;
* respuesta;
* DTO;
* comportamiento de filtros;
* comportamiento de búsqueda;
* ordenamiento;
* paginación.

---

## Criterios de finalización

* [ ] Existe `GET /api/works`.
* [ ] Requiere usuario autenticado.
* [ ] No requiere Administrator.
* [ ] Soporta Search.
* [ ] Soporta PublisherId.
* [ ] Soporta FranchiseId.
* [ ] Soporta SeriesId.
* [ ] Soporta sort.
* [ ] Soporta direction.
* [ ] Soporta paginación.
* [ ] Default: UploadedAt DESC.
* [ ] Devuelve WorkType.
* [ ] Devuelve la información necesaria para representar Publisher, Franchise y Series.
* [ ] Utiliza el wrapper de respuesta estándar.
* [ ] Utiliza la estructura de paginación estándar.
* [ ] No contiene lógica de persistencia.
* [ ] `project/endpoints.md` queda actualizado.
* [ ] La documentación específica de endpoints de Work queda actualizada si corresponde.
* [ ] La solución compila sin errores.

---

# Resultado de ejecución

## Qué se implementó

Nuevo `WorksController` con `GET /api/works`,endpoint de lectura del catálogo para usuarios autenticados. Es el primer endpoint de lectura del catálogo de Works para usuarios registrados (la superficie pública existente era solo administrativa).

## Archivos nuevos

- `api/Api/Controllers/WorksController.cs`.

## Archivos modificados

- `project/endpoints/endpoints-works.md` — sección `GET /api/works` con autenticación, query parameters, comportamiento, respuesta de ejemplo y DTO; el archivo pasa a cubrir dos controllers.
- `project/endpoints.md` — el índice de prefijos agrupa `/api/works` con `/api/admin-works`.

## Decisiones

- Ruta `api/works`, sin prefijo `admin`, siguiendo la convención de los endpoints de lectura de usuario (`api/countries`, `api/users`).
- `[Authorize]` sin `Roles`: exige token válido y no exige Administrator. No se aplicó ninguna policy con rate limiting porque es un endpoint de lectura similar a los demás listados de lectura.
- El Controller solo hace binding de `[FromQuery] GetCatalogWorksRequest`, delega en `IWorkService` y envuelve el resultado en `ApiResponse<ListResponse<WorkCatalogItemDto>>` con `StatusCodes.Status200OK`, igual que `AdminWorksController` y `CountriesController`.
- Sin consultas EF, sin lógica de filtrado, búsqueda, jerarquía ni mapeo en el Controller.
- No se expone información administrativa ni estado de procesamiento de IA.
- Nombres de query parameters en minúscula (`currentPage`, `pageSize`, `orderBy`, `orderDir`, `search`, `publisherId`, `franchiseId`, `seriesId`, `workTypeId`), igual que el resto de la API. La Task los escribía en camelCase; se respetó la convención existente del proyecto.
- `orderBy` acepta `Title`, `PublicationDate`, `CreatedAt`, `UploadedAt` y `Number`; se documentó `UploadedAt` como alias de `CreatedAt` porque la Task define el contrato del frontend con ese nombre y el dominio llama a ese campo `CreatedAt`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- `tests/Infrastructure.Tests/Integration/WorksControllerContractTests.cs` (4 tests) verifica por reflexión que el controller exige `[Authorize]`, no declara `AllowAnonymous`, no exige rol Administrator, expone la ruta `api/works` con `[HttpGet]`, y que la acción liga `GetCatalogWorksRequest` más `CancellationToken` y devuelve `Task<IActionResult>`.
- Limitación registrada: el proyecto de tests no usa `Microsoft.AspNetCore.Mvc.Testing`, por lo que la verificación de seguridad es de contrato (atributos) y no una llamada HTTP real con y sin token.
