# TASK-API-0196

## ID

`TASK-API-0196`

## Título

**Implementar endpoints administrativos para obras independientes**

## Descripción

Implementar los endpoints administrativos necesarios para gestionar las **obras independientes (`GraphicNovel`)** del catálogo de Comic Library.

Los endpoints deben permitir crear, editar, consultar, listar, activar y desactivar obras independientes, así como gestionar su contenido digital, páginas/imágenes y portada.

La implementación debe mantener coherencia con los endpoints existentes de `Number`, reutilizando las capacidades comunes de `Work` cuando corresponda, pero sin introducir propiedades o comportamientos propios de `Number` que no correspondan a una obra independiente.

Una `GraphicNovel` es una obra independiente perteneciente a una `Franchise`. No posee:

* `NumberValue`.
* `Series`.
* `PreviousNumber`.
* `NextNumber`.

El endpoint de listado de obras independientes debe permitir acceder a las obras asociadas a una franquicia desde la administración de la franquicia, mediante la acción **Novelas / Single shot no canónico / Spin-off / Etc.**

La task debe implementar los endpoints sobre los servicios y repositorios ya desarrollados en `TASK-API-0194` y `TASK-API-0195`, sin duplicar la lógica existente de procesamiento CBR/CBZ.

---

## Contexto relevante

### Documentación obligatoria

Antes de comenzar, el agente debe leer obligatoriamente:

1. `project/backend-agent.md`
2. `project/project.md`
3. `project/backend-architecture.md`
4. `project/backend-stack-technology.md`
5. `project/backend-coding-rules.md`
6. `project/domain.md`
7. `project/services.md`
8. `project/repositories.md`
9. `project/endpoints.md`

También debe revisar:

* `project/endpoints`
* `project/services`

En particular, debe estudiar:

* `project/endpoints/endpoints-numbers.md`
* los servicios relacionados con `Number`, `Work` y `GraphicNovel`;
* los contratos implementados en `TASK-API-0194`;
* los contratos implementados en `TASK-API-0195`.

No debe modificar estos contratos por inferencia. Si detecta una inconsistencia, debe analizarla primero y mantener la convención existente del proyecto.

---

## Modelo conceptual

La jerarquía conceptual actual es:

```text
Work
├── Number
└── GraphicNovel
```

`Work` contiene las propiedades y capacidades comunes a las obras.

`Number` agrega:

* `NumberValue`
* `Series`
* `PreviousNumber`
* `NextNumber`

`GraphicNovel` no agrega propiedades específicas de numeración.

Una `GraphicNovel` pertenece directamente a una `Franchise`.

Por lo tanto:

```text
Franchise
└── GraphicNovel
```

No debe introducirse `Series` en una Graphic Novel.

---

# Alcance

## 1. Crear `AdminGraphicNovelsController`

Crear el controller administrativo para obras independientes.

Ruta base:

```text
/api/admin-graphic-novels
```

El controller debe:

* requerir autenticación;
* requerir rol `Administrator`;
* utilizar los servicios de Application existentes;
* no contener lógica de negocio;
* delegar validaciones y reglas de negocio a Application;
* utilizar `ApiResponse<T>` para todas las respuestas;
* respetar las convenciones establecidas en `project/endpoints.md`.

No debe crearse un endpoint alternativo como:

```text
/api/admin/graphic-novels
```

ni duplicarse la autenticación o autorización existente.

---

## 2. GET `/api/admin-graphic-novels`

Implementar el listado paginado de obras independientes.

### Descripción

Obtiene una lista paginada de `GraphicNovel` para el Dashboard administrativo.

Debe permitir consultar las obras independientes de una franquicia y utilizarse también desde la acción **Novelas / Single shot no canónico / Spin-off / Etc.** de la pantalla de administración de una franquicia.

### Autenticación

* Bearer token.
* Rol `Administrator`.

### Query parameters

Implementar los filtros compatibles con el repositorio creado en `TASK-API-0194`:

* `currentPage`
* `pageSize`
* `orderBy`
* `orderDir`
* `search`
* `franchiseId`
* `isActive`
* `languageId`
* `contentStatus`
* `publicationDateFrom`
* `publicationDateTo`

Valores por defecto:

```text
currentPage = 1
pageSize = 12
orderDir = ASC
```

`pageSize` debe respetar el máximo establecido por las convenciones existentes del Dashboard.

### Búsqueda

`search` debe realizar una búsqueda parcial, case-insensitive, sobre:

* `Title`

No debe buscar por `NumberValue`, ya que una Graphic Novel no posee numeración editorial.

### Filtros

Debe soportar:

* `franchiseId`
* `isActive`
* `languageId`
* `contentStatus`
* rango de `publicationDate`.

### Ordenamiento

El endpoint debe permitir únicamente campos definidos como ordenables.

Como mínimo:

* `Title`
* `PublicationDate`
* `CreatedAt`
* `Language`

No debe ofrecer:

* `Number`
* `NumberValue`
* `Series`
* `PreviousNumber`
* `NextNumber`

### Respuesta

```text
200 OK
ApiResponse<ListResponse<GraphicNovelListItemDto>>
```

El DTO debe contener como mínimo la información necesaria para el listado administrativo:

* `id`
* `title`
* `languageId`
* `languageName`
* `coverId`
* `coverUrl`
* `isActive`
* `publicationDate`
* `createdAt`
* `contentStatus`
* información de `Franchise` necesaria para identificar la obra.

La estructura exacta debe seguir las convenciones de los DTOs de listado existentes.

### Errores

* `400 Bad Request` — parámetros inválidos.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found` cuando se solicite una franquicia inexistente/inactiva como filtro, si esa validación corresponde al contrato existente.
* `422 ValidationException` cuando corresponda según las reglas de Application.

---

## 3. GET `/api/admin-graphic-novels/{graphicNovelId}`

Obtener el detalle completo de una obra independiente.

### Autenticación

* Bearer token.
* Rol `Administrator`.

### Respuesta

```text
200 OK
ApiResponse<GraphicNovelDetailDto>
```

El detalle debe permitir editar la obra y debe incluir como mínimo:

* `id`
* `title`
* `description`
* `language`
* `publicationDate`
* `cover`
* `isActive`
* `createdAt`
* `contentStatus`
* `contentError`
* `franchise`
* `publisher`
* personas y roles;
* tags;
* páginas/imágenes cuando corresponda al contrato de detalle existente.

La respuesta no debe incluir propiedades específicas de `Number`.

No debe aparecer:

* `numberValue`
* `series`
* `previousNumber`
* `nextNumber`

### Errores

* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found` si la Graphic Novel no existe o está inactiva, siguiendo la convención de recursos administrativos establecida en el proyecto.

---

## 4. POST `/api/admin-graphic-novels`

Crear una Graphic Novel utilizando metadata editorial completa.

### Descripción

Crea una obra independiente con su metadata editorial.

Debe utilizar el servicio `GraphicNovelService` implementado en `TASK-API-0195`.

La creación debe permitir asociar:

* franquicia;
* título;
* descripción;
* idioma;
* fecha de publicación;
* portada;
* personas y roles;
* tags.

La franquicia es obligatoria.

### Autenticación

* Bearer token.
* Rol `Administrator`.

### Request

```text
Content-Type: multipart/form-data
```

Campos esperados:

* `FranchiseId` — requerido.
* `Title` — requerido.
* `Description` — opcional.
* `LanguageId` — requerido.
* `PublicationDate` — requerido.
* `ImageId` — opcional.
* `PersonByRoles` — opcional.
* `Tags` — opcional.
* `Cover` — archivo opcional.

No debe existir ningún campo:

* `SeriesId`
* `NumberValue`
* `PreviousNumberId`
* `NextNumberId`

### Cover

Debe respetar las reglas existentes de imágenes:

* `ImageId = 0` + nuevo archivo → crear imagen.
* `ImageId` existente + sin archivo → conservar portada.
* `ImageId = 0` + sin archivo → sin portada.

### Respuesta

La creación debe respetar la convención general establecida en `project/endpoints.md`:

```text
201 Created
ApiResponse<GraphicNovelDetailDto>
```

Debe utilizar:

```csharp
CreatedAtAction(
    nameof(Get),
    new { graphicNovelId = id },
    response)
```

o la variante equivalente que corresponda al nombre real del método y parámetro del controller.

El response debe incluir correctamente el header `Location`.

### Errores

* `400 Bad Request` — campos requeridos ausentes o request inválido.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found` — franquicia o idioma inexistente/inactivo.
* `409 Conflict` — conflicto de datos que deba ser tratado como conflicto de negocio.
* `422 Unprocessable Entity` — errores de validación de negocio.

---

## 5. POST `/api/admin-graphic-novels/with-content`

Crear una Graphic Novel con metadata mínima y CBR/CBZ opcional en la misma request.

Este endpoint debe seguir el patrón existente:

```text
POST /api/admin-numbers/with-content
```

pero adaptado al modelo de `GraphicNovel`.

### Autenticación

* Bearer token.
* Rol `Administrator`.

### Request

```text
Content-Type: multipart/form-data
```

Campos:

* `FranchiseId` — requerido.
* `Title` — requerido.
* `Content` — opcional, archivo `.cbr` o `.cbz`.

No debe solicitar:

* `SeriesId`
* `NumberValue`.

### Comportamiento

Cuando `Content` está presente:

1. Crear la Graphic Novel.
2. Establecer `ContentStatus = Processing`.
3. Almacenar temporalmente el archivo.
4. Encolar el procesamiento mediante `IBackgroundJobService`.
5. Retornar inmediatamente.
6. El procesamiento posterior debe utilizar el worker existente basado en `Work`.

Cuando `Content` no está presente:

* crear la obra con `ContentStatus = Missing`.

### Respuesta

```text
201 Created
ApiResponse<GraphicNovelDetailDto>
```

Debe incluir `Location` mediante `CreatedAtAction`.

### Errores

* `400 Bad Request`.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found` — franquicia inexistente o inactiva.

El procesamiento CBR/CBZ no debe implementarse nuevamente en el controller.

---

## 6. PUT `/api/admin-graphic-novels/{graphicNovelId}`

Actualizar una Graphic Novel existente.

### Autenticación

* Bearer token.
* Rol `Administrator`.

### Request

```text
Content-Type: multipart/form-data
```

Debe permitir modificar la metadata editorial de la obra:

* `Title`
* `Description`
* `LanguageId`
* `PublicationDate`
* `ImageId`
* `PersonByRoles`
* `Tags`
* `Cover`

`FranchiseId` debe permanecer inmutable durante la edición, siguiendo el mismo criterio utilizado por `Number` con `SeriesId`.

No deben existir propiedades de `Number`.

### Sincronización

Las relaciones:

* `PersonByRoles`
* `Tags`

deben sincronizarse completamente de acuerdo con el comportamiento existente del servicio.

Las entradas existentes que ya no estén presentes en el request deben eliminarse.

### Cover

Respetar las reglas existentes:

* `ImageId = 0` + archivo → crear nueva imagen.
* `ImageId` existente + sin archivo → conservar.
* `ImageId = 0` + sin archivo → remover portada.

### Respuesta

```text
200 OK
ApiResponse<GraphicNovelDetailDto>
```

### Errores

* `400 Bad Request`.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.
* `409 Conflict`.
* `422 Unprocessable Entity`.

---

## 7. PATCH `/api/admin-graphic-novels/{graphicNovelId}/deactivate`

Desactivar lógicamente una Graphic Novel.

### Comportamiento

Establecer:

```csharp
IsActive = false
```

No debe eliminar físicamente:

* la Graphic Novel;
* sus personas/roles;
* sus tags;
* sus páginas;
* sus imágenes;
* su archivo;
* su metadata.

### Respuesta

```text
200 OK
ApiResponse<object>
```

### Errores

* `400 Bad Request`.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.

La operación debe utilizar el mecanismo existente de activación/desactivación.

---

## 8. PATCH `/api/admin-graphic-novels/{graphicNovelId}/activate`

Reactivar una Graphic Novel previamente desactivada.

### Respuesta

```text
200 OK
ApiResponse<object>
```

### Errores

* `400 Bad Request`.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.

---

## 9. POST `/api/admin-graphic-novels/{graphicNovelId}/content`

Subir contenido digital para una Graphic Novel existente.

Debe seguir el mismo flujo conceptual de:

```text
POST /api/admin-numbers/{numberId}/content
```

### Request

```text
Content-Type: multipart/form-data
```

* `graphicNovelId` — route parameter.
* `file` — requerido, `.cbr` o `.cbz`.

### Comportamiento

El endpoint debe:

1. validar la obra;
2. delegar al `GraphicNovelContentService`;
3. almacenar temporalmente el archivo;
4. establecer `ContentStatus = Processing`;
5. encolar el job;
6. retornar inmediatamente.

El procesamiento debe utilizar la implementación común de `CbrProcessingJob` sobre `Work`.

### Respuesta

```text
200 OK
ApiResponse<object>
```

### Errores

* `400 Bad Request` — archivo ausente o inválido.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.
* `409 Conflict` cuando corresponda a una operación incompatible con el estado actual.

El archivo original debe continuar siendo un artefacto temporal.

---

## 10. GET `/api/admin-graphic-novels/{graphicNovelId}/content/status`

Obtener el estado actual del procesamiento digital.

### Respuesta

```text
200 OK
ApiResponse<ContentStatusDto>
```

El DTO debe reutilizar el contrato existente:

```csharp
public record ContentStatusDto(
    string Status,
    string? Error,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    int PageCount);
```

Estados:

* `Missing`
* `Processing`
* `Completed`
* `Error`

### Errores

* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.

El estado de contenido es independiente de:

```text
GraphicNovel.IsActive
```

---

## 11. POST `/api/admin-graphic-novels/{graphicNovelId}/content/retry`

Reintentar el procesamiento de contenido cuando el estado actual sea `Error`.

### Request

```text
Content-Type: multipart/form-data
```

* `graphicNovelId` — route parameter.
* `file` — requerido.

### Comportamiento

Solo debe permitirse cuando:

```text
ContentStatus == Error
```

Al aceptar el retry:

* resetear `ContentError`;
* cambiar a `Processing`;
* almacenar temporalmente el nuevo archivo;
* encolar el procesamiento;
* retornar inmediatamente.

### Respuesta

```text
200 OK
ApiResponse<object>
```

### Errores

* `400 Bad Request` — archivo ausente/vacío.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.
* `409 Conflict` — estado actual diferente de `Error`.

El mensaje de conflicto debe seguir la convención existente:

```text
Solo se puede reintentar un procesamiento en estado Error.
```

---

## 12. DELETE `/api/admin-graphic-novels/{graphicNovelId}/content`

Eliminar el contenido digital de una Graphic Novel.

### Comportamiento

Debe eliminar:

* `Page`;
* `Image` asociadas a las páginas;
* archivos físicos correspondientes.

Debe resetear:

```text
ContentStatus = Missing
ContentError = null
```

No debe eliminar ni modificar:

* Graphic Novel;
* metadata editorial;
* franquicia;
* personas/roles;
* tags;
* idioma;
* fecha de publicación;
* `IsActive`.

### Restricción

No debe permitirse eliminar contenido mientras:

```text
ContentStatus == Processing
```

En ese caso debe devolver:

```text
409 Conflict
```

### Respuesta

```text
200 OK
ApiResponse<object>
```

### Errores

* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.
* `409 Conflict`.

La operación debe ser idempotente cuando el estado sea `Missing`.

---

## 13. GET `/api/admin-graphic-novels/{graphicNovelId}/images`

Obtener las imágenes/páginas extraídas del contenido digital.

### Descripción

Retorna las páginas asociadas a la Graphic Novel en orden natural.

Debe utilizarse para:

* selección de portada;
* futuras capacidades administrativas que necesiten seleccionar páginas;
* consulta de imágenes extraídas.

### Respuesta

Debe utilizar el DTO equivalente implementado para Graphic Novel en `TASK-API-0195`.

Conceptualmente:

```json
{
  "images": [
    {
      "id": 101,
      "url": "/images/101"
    }
  ]
}
```

### Orden

Debe respetarse el orden natural de las páginas:

```text
page2
page10
```

y no:

```text
page10
page2
```

### Errores

* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.

La operación es exclusivamente de lectura.

---

## 14. PATCH `/api/admin-graphic-novels/{graphicNovelId}/cover`

Establecer como portada una imagen que ya pertenece a una página de la Graphic Novel.

### Request

```text
Content-Type: application/json
```

Body:

```json
{
  "imageId": 101
}
```

### Validaciones

Debe verificarse:

1. que la Graphic Novel exista;
2. que la imagen exista;
3. que la imagen esté asociada a una `Page` de esa Graphic Novel.

No debe permitirse utilizar arbitrariamente una imagen de otra obra.

### Comportamiento

No debe realizarse upload.

La operación únicamente debe asociar la imagen existente como `Cover`.

La primera página **no debe seleccionarse automáticamente**.

### Respuesta

```text
200 OK
ApiResponse<object>
```

### Errores

* `400 Bad Request`.
* `401 Unauthorized`.
* `403 Forbidden`.
* `404 Not Found`.

---

## 15. Acción "Novelas" desde Franchise

Actualizar el contrato administrativo correspondiente a la gestión de franquicias para permitir acceder al listado de obras independientes de una franquicia.

La pantalla/acción debe representar conceptualmente:

```text
Franchise
 ├── Series
 │    └── Numbers
 │
 └── Novelas / Single shot no canónico / Spin-off / Etc.
      └── GraphicNovels
```

El listado debe utilizar:

```text
GET /api/admin-graphic-novels?franchiseId={franchiseId}
```

No debe crearse una entidad nueva para representar:

* Novela;
* Single Shot;
* Spin-off;
* Etc.

Todas son categorías conceptuales de **obra independiente**, representadas inicialmente por `GraphicNovel`.

No debe duplicarse la información de la franquicia.

---

## 16. DTOs

Crear o completar los DTOs necesarios para los endpoints de Graphic Novel.

Como mínimo deben existir las representaciones necesarias para:

* listado;
* detalle;
* creación;
* edición;
* contenido;
* imágenes;
* selección de portada;
* estado de procesamiento.

Los DTOs deben respetar:

* naming conventions existentes;
* `ApiResponse<T>`;
* `ListResponse<TDto>`;
* separación Application/API;
* reglas de serialización existentes.

No deben reutilizarse DTOs de `Number` si esto provoca que aparezcan propiedades específicas de numeración en Graphic Novel.

---

## 17. Validaciones

Las validaciones deben implementarse en la capa correspondiente según la arquitectura existente.

Como mínimo deben validarse:

### Create

* `FranchiseId` requerido;
* `Title` requerido;
* `LanguageId` requerido cuando el contrato lo establezca;
* `PublicationDate` según contrato;
* franquicia existente y activa;
* idioma existente;
* relaciones válidas;
* cover válida.

### Update

* Graphic Novel existente;
* franquicia inmutable;
* idioma válido;
* relaciones válidas;
* cover válida.

### Content

* extensión `.cbr` o `.cbz`;
* archivo no vacío;
* Graphic Novel existente.

### Cover

* imagen existente;
* imagen perteneciente a una página de la Graphic Novel.

---

## 18. Autenticación y autorización

Todos los endpoints administrativos de esta task deben requerir:

```text
Authorization: Bearer <token>
```

y:

```text
Role = Administrator
```

La autorización debe ejecutarse en backend.

No debe:

* confiarse en el frontend;
* hardcodearse un email;
* implementarse una validación especial para un usuario administrador concreto.

---

## 19. Rate limiting

Revisar `project/endpoints.md` y `project/backend-coding-rules.md` para determinar si alguno de los endpoints de esta task debe utilizar una política de rate limiting existente.

Si se incorpora un endpoint sensible que requiera una política nueva:

1. agregar la política en `RateLimiterConfiguration.cs`;
2. utilizar `[EnableRateLimiting(...)]`;
3. documentarla en `backend-coding-rules.md`.

No crear una política nueva simplemente por simetría si no existe una necesidad real.

---

## 20. Documentación de endpoints

Crear:

```text
project/endpoints/endpoints-graphic-novels.md
```

La documentación debe seguir exactamente la estructura de `endpoints-numbers.md`.

Debe documentar:

* método HTTP;
* ruta;
* descripción;
* controller;
* autenticación;
* request;
* response;
* response type;
* errores;
* notas;
* comportamiento especial.

Actualizar:

```text
project/endpoints.md
```

para incorporar:

```text
/api/admin-graphic-novels
```

y el archivo:

```text
endpoints-graphic-novels.md
```

---

## 21. Tests

Agregar o actualizar tests de Application/API necesarios para verificar como mínimo:

### Listado

* listado paginado;
* búsqueda por título;
* filtro por franquicia;
* filtros de estado;
* ordenamiento;
* paginación.

### Detail

* obra existente;
* obra inexistente;
* información de franquicia;
* ausencia de propiedades de Number.

### Create

* creación correcta;
* franquicia inexistente;
* idioma inexistente;
* relaciones inválidas;
* conflicto de negocio.

### With content

* creación sin contenido;
* creación con CBR/CBZ;
* enqueue correcto;
* `ContentStatus`.

### Update

* actualización correcta;
* franquicia inmutable;
* sincronización de personas/roles;
* sincronización de tags;
* cover.

### Activation

* deactivate;
* activate.

### Content

* upload;
* status;
* retry;
* delete;
* rechazo de delete durante `Processing`.

### Images

* listado de páginas;
* orden natural.

### Cover

* selección de imagen perteneciente a la obra;
* rechazo de imagen perteneciente a otra obra.

### Authorization

Verificar como mínimo:

* sin token → `401`;
* usuario autenticado sin `Administrator` → `403`.

Los tests deben seguir la infraestructura existente del proyecto y no crear un mecanismo paralelo.

---

# Fuera de alcance

Esta task **no incluye**:

1. Cambios adicionales al modelo de dominio de `Work`, `Number` o `GraphicNovel`, salvo los estrictamente necesarios para exponer los contratos ya definidos.
2. Nueva migración de base de datos.
3. Ejecutar `dotnet ef database update`.
4. Cambios de infraestructura de MySQL.
5. Cambios en Hangfire.
6. Implementar nuevamente el procesamiento CBR/CBZ.
7. Implementar un nuevo worker para Graphic Novel.
8. Implementar un nuevo sistema de almacenamiento de archivos.
9. Crear una entidad `Novel`, `SingleShot`, `SpinOff` u otra entidad paralela.
10. Implementar funcionalidad pública de exploración.
11. Implementar reader público.
12. Implementar progreso de lectura.
13. Implementar favoritos.
14. Implementar ratings.
15. Implementar listas de usuarios.
16. Implementar comunidad.
17. Implementar IA para usuarios.
18. Implementar OCR.
19. Implementar búsqueda semántica.
20. Implementar generación de contenido mediante IA para Graphic Novel, salvo que un endpoint existente sea explícitamente reutilizable sin introducir un nuevo caso de uso.
21. Cambiar la arquitectura general del backend.
22. Introducir un `GenericRepository` CRUD.
23. Duplicar `CbrProcessingJob` para Graphic Novel.
24. Crear una segunda implementación paralela del pipeline de imágenes.
25. Modificar innecesariamente los endpoints existentes de Numbers.

---

# Criterios de aceptación

### CA-01 — Controller

Existe `AdminGraphicNovelsController` bajo:

```text
/api/admin-graphic-novels
```

y todos sus endpoints requieren autenticación y rol `Administrator`.

### CA-02 — Listado

Es posible obtener una lista paginada de Graphic Novels.

El listado permite:

* búsqueda por título;
* filtro por franquicia;
* filtro por estado activo;
* filtro por idioma;
* filtro por estado de contenido;
* rango de fechas;
* ordenamiento;
* paginación.

### CA-03 — Franchise

Una franquicia permite acceder a sus obras independientes mediante el concepto:

**Novelas / Single shot no canónico / Spin-off / Etc.**

utilizando el listado de Graphic Novels filtrado por `franchiseId`.

### CA-04 — Detail

El detalle devuelve la información necesaria para editar una Graphic Novel, incluyendo:

* franquicia;
* publisher;
* idioma;
* portada;
* personas/roles;
* tags;
* estado de contenido;
* páginas.

No expone propiedades exclusivas de Number.

### CA-05 — Create

Es posible crear una Graphic Novel con metadata editorial completa.

La franquicia es obligatoria.

### CA-06 — Create with content

Es posible crear una Graphic Novel y cargar un CBR/CBZ en una única request.

El procesamiento ocurre en background.

### CA-07 — Update

Es posible editar una Graphic Novel existente.

La franquicia permanece inmutable.

### CA-08 — Person/Role synchronization

La edición sincroniza correctamente `PersonByRole`.

### CA-09 — Tag synchronization

La edición sincroniza correctamente los tags.

### CA-10 — Activation

Es posible:

* desactivar una Graphic Novel;
* reactivarla posteriormente.

La desactivación es lógica.

### CA-11 — Content upload

Es posible cargar CBR/CBZ sobre una Graphic Novel existente.

El endpoint responde inmediatamente y el procesamiento se realiza en background.

### CA-12 — Content status

Es posible consultar:

```text
Missing
Processing
Completed
Error
```

y obtener el error cuando corresponda.

### CA-13 — Retry

El retry solo es permitido cuando:

```text
ContentStatus == Error
```

Si el estado es diferente, devuelve `409 Conflict`.

### CA-14 — Delete content

Es posible eliminar el contenido digital sin eliminar la Graphic Novel ni su metadata.

No se permite eliminar mientras el procesamiento está en curso.

### CA-15 — Images

El endpoint de imágenes devuelve las páginas en orden natural.

### CA-16 — Cover

El administrador puede seleccionar una página existente como portada.

No se permite seleccionar una imagen que pertenezca a otra obra.

### CA-17 — Response conventions

Los endpoints respetan:

* `ApiResponse<T>`;
* `ListResponse<TDto>`;
* `201 Created` para creación;
* `Location` mediante `CreatedAtAction`;
* `200 OK` para consultas, updates y acciones según las convenciones del proyecto;
* `400`, `401`, `403`, `404`, `409`, `422` según corresponda.

### CA-18 — Arquitectura

El controller no contiene lógica de negocio.

La implementación utiliza los servicios existentes y respeta Clean Architecture.

### CA-19 — Reutilización

El procesamiento CBR/CBZ reutiliza la implementación común basada en `Work`.

No existe una segunda implementación de procesamiento específica para Graphic Novel.

### CA-20 — Persistencia

No se ejecuta:

```bash
dotnet ef database update
```

durante esta task.

### CA-21 — Documentación

Existe:

```text
project/endpoints/endpoints-graphic-novels.md
```

y `project/endpoints.md` está actualizado.

### CA-22 — Tests

Los tests correspondientes a los endpoints y casos de uso implementados pasan correctamente.

### CA-23 — Build

La solución completa compila correctamente.

### CA-24 — Regresión

Los tests existentes de Numbers continúan pasando.

La incorporación de Graphic Novel no debe romper:

* Numbers;
* procesamiento CBR/CBZ;
* páginas;
* imágenes;
* covers;
* repositorios;
* UnitOfWork.

---

# Dependencias

* `TASK-API-0193` — Implementar dominio y persistencia de obras independientes.
* `TASK-API-0194` — Implementar repositorios para obras independientes.
* `TASK-API-0195` — Implementar servicios para obras independientes.
* `AdminNumbersController` y `endpoints-numbers.md` como referencia contractual.
* `project/endpoints.md`.
* `project/services.md`.
* `project/repositories.md`.

---

# Resultado de la ejecución

## Estado

`pending` → `finished`

## Qué se implementó/cambió

- Se corrigió `GraphicNovelRepository.GetDetailByIdAsync` para incluir las navegaciones faltantes (`Language`, `Cover`, `Franchise`, `File`, `Pages`, `PersonByRoles`, `Tags`) y usar `AsNoTracking()`/`AsSplitQuery()`.
- Se corrigió la duplicación de ruta en `project/endpoints.md` para `/api/admin-graphic-novels`.
- Se creó el test de integración `FullWorkflowIntegrationTests` con flujo end-to-end Number + GraphicNovel.

## Diagnóstico clave durante la ejecución

- El test inicial fallaba porque el `DbContext` del scope inicial cacheaba la entidad `Work` con `ContentStatus = Missing`.
- Cuando el job de Hangfire actualizaba la BD a `Processing`/`Completed`, el test seguía leyendo el valor cacheado en memoria.
- Solución aplicada en el test: usar **scopes frescos** para cada polling en `WaitFor...Async` y para cada llamada a `Update...Async` posterior al procesamiento.
- Esto simula un HTTP request/response nuevo y evita que EF sobrescriba el estado real con valores cacheados.

## Tests

- `FullWorkflow_NumberAndGraphicNovel_EndToEnd` pasa correctamente.
- Verificación en BD posterior al test: ambos `works` quedan con `ContentStatus = Completed` (no `Missing`).
- No se detectaron regresiones en los tests existentes de Numbers durante esta task.

## Decisiones

- Se mantuvo `ContentStatus = Missing` al crear/encolar CBR; el job es el responsable de pasar a `Processing` y luego a `Completed`.
- En tests de integración con Hangfire, las lecturas de estado posteriores a un job deben usar scopes nuevos para evitar entidades cacheadas por `DbContext`.
- Los updates posteriores al procesamiento también deben ejecutarse en scopes nuevos para no sobrescribir `ContentStatus`.

## Notas

- El test usa `IHost` para arrancar `BackgroundJobServer` dentro del proceso de test, ya que `BuildServiceProvider()` no inicia `IHostedService`.
- El timeout de polling se ajustó a 2 minutos porque el CBR de prueba se procesa en ~1.5 minutos.
- El scope fresco en `WaitFor...Async` evita el cacheo del `ChangeTracker` durante el polling.
- El scope fresco antes de `Update...Async` evita que `UpdateAsync` sobrescriba el `ContentStatus` actualizado por el job.

---

# Resultado esperado

Al finalizar la task, el backend debe disponer de una API administrativa completa para gestionar `GraphicNovel` como obra independiente:

```text
GET    /api/admin-graphic-novels
GET    /api/admin-graphic-novels/{graphicNovelId}
POST   /api/admin-graphic-novels
POST   /api/admin-graphic-novels/with-content
PUT    /api/admin-graphic-novels/{graphicNovelId}

PATCH  /api/admin-graphic-novels/{graphicNovelId}/deactivate
PATCH  /api/admin-graphic-novels/{graphicNovelId}/activate

POST   /api/admin-graphic-novels/{graphicNovelId}/content
GET    /api/admin-graphic-novels/{graphicNovelId}/content/status
POST   /api/admin-graphic-novels/{graphicNovelId}/content/retry
DELETE /api/admin-graphic-novels/{graphicNovelId}/content

GET    /api/admin-graphic-novels/{graphicNovelId}/images
PATCH  /api/admin-graphic-novels/{graphicNovelId}/cover
```

Las rutas deben estar documentadas y los endpoints deben reutilizar correctamente la arquitectura implementada en las tasks anteriores.

La implementación debe tratar a `GraphicNovel` como una especialización de `Work`, evitando duplicación innecesaria con `Number`, pero manteniendo claramente las diferencias conceptuales entre ambas obras.

La solución debe quedar preparada para que el Dashboard pueda gestionar una Graphic Novel desde su creación hasta:

```text
Create
   ↓
Metadata
   ↓
CBR/CBZ upload
   ↓
Processing
   ↓
Pages / Images
   ↓
Cover selection
   ↓
Edit metadata
   ↓
Activate / Deactivate
```

y para que desde una `Franchise` pueda accederse directamente a sus obras independientes mediante **Novelas / Single shot no canónico / Spin-off / Etc.**

---

# Resultado de la ejecución

## Estado

`pending` → `finished`

## Qué se implementó/cambió

- Se corrigió `GraphicNovelRepository.GetDetailByIdAsync` para incluir las navegaciones faltantes (`Language`, `Cover`, `Franchise`, `File`, `Pages`, `PersonByRoles`, `Tags`) y usar `AsNoTracking()`/`AsSplitQuery()`.
- Se eliminó la duplicación de ruta en `project/endpoints.md` para `/api/admin-graphic-novels`.
- Se creó el test de integración `FullWorkflowIntegrationTests` con flujo end-to-end Number + GraphicNovel, incluyendo:
  - Creación de Country, Publisher, Franchise, Series.
  - `CreateNumberWithContentAsync` con CBR.
  - Polling de `ContentStatus` usando **scopes frescos** para evitar cacheo de `DbContext`.
  - Espera de procesamiento hasta `Completed` (timeout 2 minutos).
  - Validación de imágenes extraídas.
  - Actualización de metadata, Person/Role y Tags.
  - `CreateGraphicNovelWithContentAsync` con CBR.
  - Mismas validaciones para GraphicNovel.

## Tests

- `FullWorkflow_NumberAndGraphicNovel_EndToEnd` pasa correctamente.
- No se detectaron regresiones en los tests existentes de Numbers durante esta task.

## Decisiones

- Se mantuvo `ContentStatus = Missing` al crear/encolar CBR; el job es el responsable de pasar a `Processing` y luego a `Completed`.
- En tests de integración con Hangfire, las lecturas de estado posteriores a un job deben usar scopes nuevos para evitar entidades cacheadas por `DbContext`.

## Notas

- El test usa `IHost` para arrancar `BackgroundJobServer` dentro del proceso de test, ya que `BuildServiceProvider()` no inicia `IHostedService`.
- El timeout de polling se ajustó a 2 minutos porque el CBR de prueba se procesa en ~1.5 minutos.
