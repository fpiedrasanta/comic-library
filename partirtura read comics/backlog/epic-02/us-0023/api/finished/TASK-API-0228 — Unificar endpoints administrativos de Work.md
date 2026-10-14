# TASK-API-0228 — Unificar endpoints administrativos de Work

## Objetivo

Unificar los endpoints administrativos de obras bajo un único recurso `Work`.

La API debe dejar de exponer operaciones separadas para `Number` y `GraphicNovel`.

El backend debe recibir y devolver una representación unificada de `Work`.

`WorkTypeId` clasifica la obra, pero **no determina reglas de negocio ni modifica el comportamiento del endpoint**.

## Documentación obligatoria

Antes de modificar código:

1. Leer `project/endpoints.md`.
2. Revisar las documentaciones específicas de:

   * endpoints de `Work`;
   * endpoints de `Number`;
   * endpoints de `GraphicNovel`.
3. Revisar `project/services.md`.
4. Revisar `project/services/services-catalog.md`.
5. Inspeccionar los controllers actuales relacionados con estas entidades.

Al finalizar:

* actualizar `project/endpoints.md`;
* actualizar o reemplazar las documentaciones específicas de endpoints que hayan quedado obsoletas;
* documentar el nuevo contrato unificado.

## Recurso unificado

El recurso administrativo debe ser:

```text
/api/admin-works
```

Debe utilizar el servicio unificado de `Work`.

### Endpoints

Implementar las operaciones correspondientes al CRUD administrativo de `Work`:

```text
GET    /api/admin-works
NOTA: 
 - Si pido un listado con PublisherId, me debe traer todas las obras que tenga publisher pero que FranchiseId y SeriesId sean NULL.
 - Si pido un listado con FranchiseId, me debe traer todas las obras que tenga Franchise pero que Publisher y SeriesId sean NULL.
 - Si pido un listado con SeriesId, me debe traer todas las obras que tenga Series pero que PublisherId y FranchiseId sean NULL.
Puede ser algo cómo:
   /api/admin-works?filtros y parametros de búsqueda => Trae todas las obras, dependa de quien dependa.
   /api/admin-works/publisher/{id}?filtros y parametros de búsqueda => Trae los que dependen de un publisher.
   /api/admin-works/franchise/{id}?filtros y parametros de búsqueda => Trae los que dependen de una franquicia.
   /api/admin-works/series/{id}?filtros y parametros de búsqueda => Trae los que dependen de una serie.
GET    /api/admin-works/{workId}
POST   /api/admin-works
PUT    /api/admin-works/{workId}
```

Mantener las convenciones actuales del proyecto para:

* autorización;
* paginación;
* búsqueda;
* ordenamiento;
* filtros;
* respuestas;
* códigos HTTP;
* manejo centralizado de errores;
* rate limiting cuando corresponda.

## Creación

`POST /api/admin-works` debe recibir una única request de creación de `Work`.

La request debe incluir `WorkTypeId` y los datos propios de `Work`.

Ejemplo conceptual:

```json
{
  "workTypeId": 1,
  "title": "X-Men #1",
  "seriesId": 10,
  "nextNumberId": 2,
  "previousNumberId": null
}
```

Otra obra puede utilizar:

```json
{
  "workTypeId": 2,
  "title": "Messiah Complex",
  "seriesId": null,
  "nextNumberId": null,
  "previousNumberId": null
}
```

El endpoint debe tratar ambas requests exactamente como creación de `Work`.

No debe existir lógica del tipo:

```text
if WorkType == Number
```

ni:

```text
if WorkType == GraphicNovel
```

en el controller.

## Actualización

`PUT /api/admin-works/{workId}` debe recibir una única request de actualización de `Work`.

Debe permitir modificar los datos correspondientes a la entidad unificada, incluyendo cuando corresponda:

* `WorkTypeId`;
* `SeriesId`;
* `NextNumberId`;
* `PreviousNumberId`;
* demás propiedades de `Work`.

Las propiedades opcionales deben poder establecerse en `null`.

## Eliminación / estado

Revisar el comportamiento actual de `Work` y conservar la estrategia de eliminación lógica o cambio de estado que corresponda al modelo existente.

Si actualmente las obras utilizan activación/desactivación, exponer el comportamiento mediante el recurso unificado:

```text
DELETE /api/admin-works/{workId}
POST   /api/admin-works/{workId}/activate
```

No eliminar físicamente una obra si la arquitectura actual establece eliminación lógica.

## Listado

El listado debe trabajar sobre `Work` directamente.

Debe conservar las capacidades de consulta existentes que continúen siendo válidas.

Cuando sea necesario filtrar por tipo de obra, utilizar:

```text
WorkTypeId
```

No filtrar ni buscar por nombres concretos de `WorkType` desde el controller.

La implementación debe respetar el contrato de paginación, búsqueda, filtros y ordenamiento existente para `Work`.

## GraphicNovel y Number

Eliminar del API administrativo los endpoints que existan exclusivamente para administrar:

```text
/api/admin-numbers
/api/admin-graphic-novels
```

o sus equivalentes actuales.

No mantener endpoints duplicados como compatibilidad.

Todas las operaciones administrativas deben realizarse mediante:

```text
/api/admin-works
```

Una obra que anteriormente se administraba mediante `admin-numbers` ahora se administra mediante `admin-works`.

Una obra que anteriormente se administraba mediante `admin-graphic-novels` ahora se administra mediante `admin-works`.

## Controller

El controller debe permanecer delgado.

Debe:

* recibir requests;
* delegar al servicio;
* devolver las respuestas HTTP correspondientes.

No debe contener:

* lógica de negocio;
* interpretación de `WorkType`;
* validaciones específicas del tipo de obra;
* acceso directo a Entity Framework;
* consultas al `DbContext`;
* lógica de persistencia.

Mantener:

```text
Controller
    ↓
WorkService
    ↓
WorkRepository
    ↓
Entity Framework
```

## Compatibilidad

Revisar todos los consumidores internos del API que puedan estar utilizando los endpoints anteriores.

La eliminación de los endpoints separados no debe dejar referencias activas dentro de la solución.

No modificar todavía Dashboard ni Public Web salvo que exista código estrictamente necesario para que la solución compile.

Las modificaciones de frontend correspondientes serán realizadas posteriormente.

## Documentación de endpoints

La documentación debe dejar claramente establecido que:

* `Work` es el único recurso para administrar obras.
* `WorkTypeId` clasifica la obra.
* `WorkType` no determina reglas estructurales.
* Las relaciones opcionales de `Work` pueden ser `null`.
* No existen endpoints administrativos separados por tipo de obra.

## Criterios de aceptación

* [ ] Existe `GET /api/admin-works`.
* [ ] Existe `GET /api/admin-works/{workId}`.
* [ ] Existe `POST /api/admin-works`.
* [ ] Existe `PUT /api/admin-works/{workId}`.
* [ ] Existe el endpoint de desactivación lógica si corresponde al modelo actual.
* [ ] Existe el endpoint de activación si corresponde al modelo actual.
* [ ] Los endpoints administrativos separados de `Number` dejan de utilizarse.
* [ ] Los endpoints administrativos separados de `GraphicNovel` dejan de utilizarse.
* [ ] Todas las operaciones utilizan `WorkService`.
* [ ] El controller no interpreta `WorkType`.
* [ ] `WorkTypeId` se trata como dato de clasificación.
* [ ] Las relaciones opcionales pueden recibir `null`.
* [ ] Se mantienen los códigos HTTP y convenciones del API.
* [ ] Se mantienen autorización, rate limiting y manejo centralizado de errores según corresponda.
* [ ] No existen referencias activas a los endpoints administrativos obsoletos dentro del backend.
* [ ] `project/endpoints.md` queda actualizado.
* [ ] Las documentaciones específicas obsoletas son actualizadas o eliminadas.
* [ ] La solución compila sin errores ni warnings.
* [ ] Los tests existentes relacionados con endpoints de Work continúan pasando.

## Resultado de la ejecución

### Qué se implementó

* `AdminWorksController` unificado con endpoints: list all, by publisher, by franchise, by series, get by id, create, create with content, update, activate, deactivate.
* Eliminados `AdminNumbersController` y `AdminGraphicNovelsController`.
* Ruta de AI analysis actualizada a `/api/admin-works/ai-analysis`.
* `WorkFormRequests` creados en `Api/DTOs`.
* `GetWorksRequest` cambiado de `workType string` a `workTypeId long`.
* Rate limit policy `AdminWorkCreate` agregada.
* Documentación actualizada: `endpoints.md`, `endpoints-works.md`.

### Archivos modificados

* `Api/Controllers/AdminWorksController.cs`
* `Api/DTOs/WorkFormRequests.cs` (nuevo)
* `Api/DTOs/GetWorksRequest.cs`
* `Api/Program.cs`
* `project/endpoints.md`
* `project/endpoints/endpoints-works.md`

### Decisiones relevantes

* Filtros por `publisherId`, `franchiseId`, `seriesId` implementados como rutas separadas más query params.
* `WorkTypeId` es clasificación; el controller no interpreta su valor.
* Eliminación lógica preservada mediante `IsActive` y endpoints `activate`/`deactivate`.

### Notas

* La solución compila sin errores ni warnings.
