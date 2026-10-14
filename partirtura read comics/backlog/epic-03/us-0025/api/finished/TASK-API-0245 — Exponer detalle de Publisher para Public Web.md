# TASK-API-0245 — Exponer detalle de Publisher para Public Web

## Objetivo

Exponer mediante un endpoint destinado al **Public Web** la información necesaria para mostrar la página de detalle de una Editorial/Publisher.

El endpoint debe estar disponible para **cualquier usuario autenticado**, sin requerir el rol `Administrator`.

**En este proyecto, “Public Web” NO significa acceso anónimo ni acceso público sin autenticación.**

La operación debe servir como fuente de datos para:

```text
/publishers/:id
```

La implementación debe respetar la arquitectura existente y reutilizar las abstracciones actuales de Publisher cuando corresponda.

---

## Contexto

Public Web ya permite navegar a:

```text
/publishers/:id
```

Actualmente la página puede obtener información insuficiente para construir el nuevo diseño visual de la Editorial.

El nuevo diseño UX/UI contempla:

* Logo de la Editorial.
* Tipo: `Editorial`.
* Nombre.
* Color de la entidad.
* País.
* Año de fundación.
* Sitio web.
* Descripción breve.
* Historia.

El identificador interno (`Id`) es necesario para localizar el recurso, pero **no debe formar parte de la información presentada visualmente al usuario**.

La imagen asociada representa el **logo de la Editorial**, no una portada/banner.

---

# Seguridad

Este endpoint pertenece al **Public Web autenticado**.

Debe cumplir exactamente estas condiciones:

* Requiere autenticación.
* Debe rechazar solicitudes anónimas.
* No requiere rol `Administrator`.
* Un usuario autenticado con cualquier rol permitido para Public Web puede utilizarlo.
* No debe utilizar `[AllowAnonymous]`.
* No debe quedar dentro de un grupo/controller configurado para acceso anónimo.
* No debe reutilizar accidentalmente las reglas de seguridad de endpoints administrativos.
* No debe exponer información administrativa de Publisher.

La existencia de un endpoint destinado al Public Web **no implica que el recurso sea públicamente accesible por Internet sin autenticación**.

---

## Alcance

### 1. Revisar el dominio existente

Antes de modificar código:

* Revisar la entidad `Publisher`.
* Revisar sus relaciones existentes.
* Revisar cómo se almacenan actualmente:

  * logo/imagen;
  * país;
  * color;
  * sitio web;
  * descripción;
  * información histórica.
* Revisar si alguno de estos datos ya existe con otro nombre o mediante una relación existente.
* No crear propiedades duplicadas si el dominio ya dispone de un concepto equivalente.

Si un dato requerido por la nueva UI **no existe actualmente en el dominio**, documentarlo explícitamente como faltante.

No inventar información ni introducir campos nuevos únicamente para completar el DTO.

---

## 2. Repository

Revisar el repositorio existente de Publisher.

Crear una operación específica para obtener el detalle de un Publisher por `Id`, si no existe una operación equivalente reutilizable.

La consulta debe:

* buscar exclusivamente el Publisher solicitado;
* excluir Publishers inexistentes mediante el mecanismo estándar del servicio;
* utilizar `AsNoTracking()` para una consulta de lectura;
* cargar únicamente las relaciones necesarias para construir el detalle destinado al Public Web;
* evitar N+1;
* no reutilizar una consulta administrativa si eso implica cargar o exponer información administrativa innecesaria.

No devolver DTOs desde Repository.

El Repository debe devolver entidades/datos de dominio según las convenciones existentes.

---

## 3. Service

Agregar una operación de servicio para obtener el detalle del Publisher destinado al Public Web.

El Service debe:

* recibir el `PublisherId`;
* validar la existencia mediante las convenciones existentes;
* utilizar el Repository;
* mapear la entidad a un DTO específico para Public Web;
* no exponer entidades de persistencia;
* no incluir información administrativa;
* construir la URL del logo mediante el mecanismo existente para imágenes;
* respetar el modelo actual de colores de entidades.

### DTO

El DTO debe contener únicamente los datos necesarios para esta pantalla y que realmente existan en el dominio.

Como contrato objetivo:

```text
PublisherDetailDto
├── Id
├── Name
├── Color
├── ImageUrl
├── CountryName
├── FoundationYear
├── Website
├── ShortDescription
└── History
```

`Id` puede formar parte del contrato técnico aunque no se muestre en la UI.

Si alguno de estos campos no existe actualmente en el dominio, **no inventarlo ni simularlo**.

Documentar claramente qué información falta.

---

## 4. Endpoint

Agregar:

```http
GET /api/publishers/{id}
```

Este endpoint pertenece al **Public Web autenticado**.

### Seguridad

Debe:

```text
Authenticated user:    YES
Administrator role:    NO
Anonymous user:        NO
```

Es decir:

```text
Usuario anónimo
    ↓
    401 / mecanismo estándar de autenticación

Usuario autenticado
    ↓
    acceso permitido

Usuario autenticado + Administrator
    ↓
    acceso permitido
```

El endpoint no debe requerir `Administrator`.

Utilizar las convenciones actuales del proyecto para `[Authorize]` y autorización.

### Respuesta

* `200 OK` cuando el Publisher existe.
* Respuesta estándar de recurso inexistente cuando no existe.
* Utilizar `ApiResponse<T>` según las convenciones actuales.
* No contener lógica de negocio.
* No acceder directamente a EF/DbContext.

---

## 5. Imagen / Logo

El Publisher debe devolver la referencia necesaria para mostrar su **logo**.

No crear un endpoint específico de imagen si ya existe el mecanismo actual de imágenes del proyecto.

Utilizar el mecanismo existente para construir `ImageUrl`.

El endpoint no debe exponer directamente:

* `StoragePath`;
* rutas físicas;
* información interna del almacenamiento;
* identificadores internos de infraestructura que no sean necesarios para el contrato.

El logo debe seguir las mismas reglas de acceso utilizadas actualmente por Public Web para imágenes protegidas.

---

## 6. Datos opcionales

Los siguientes datos pueden no estar disponibles para todos los Publishers:

* Logo.
* País.
* Año de fundación.
* Sitio web.
* Descripción breve.
* Historia.

El contrato debe permitir valores ausentes cuando corresponda.

No utilizar valores ficticios ni placeholders generados por Backend.

La ausencia de un dato no debe provocar una excepción si el dato es opcional.

---

## 7. Información administrativa

El endpoint debe devolver **solamente información apropiada para Public Web**.

No incluir información destinada exclusivamente al Dashboard o administración, aunque dicha información exista en la entidad `Publisher`.

No reutilizar directamente DTOs administrativos como contrato del Public Web.

Si el proyecto actualmente utiliza un DTO administrativo que contiene campos adicionales, crear/adaptar un DTO específico para esta operación.

---

## 8. Documentación

Actualizar, según corresponda:

```text
project/services.md
project/services/services-catalog.md
project/repositories.md
project/repositories/repositories-catalog.md
project/endpoints.md
project/endpoints-publishers.md
```

La documentación del endpoint debe dejar explícitamente indicado que:

```text
Audience: Public Web authenticated users
Authentication: Required
Administrator role: Not required
Anonymous access: Not allowed
```

No utilizar la palabra “public” para indicar acceso anónimo.

---

## 9. Tests

Agregar tests para verificar como mínimo:

### Autenticación y autorización

1. Solicitud anónima al endpoint es rechazada.
2. Usuario autenticado puede utilizar el endpoint.
3. Usuario autenticado no necesita rol `Administrator`.
4. Usuario con rol `Administrator` también puede utilizarlo.
5. El endpoint no tiene `[AllowAnonymous]`.

### Datos

6. Publisher existente devuelve `200`.
7. Publisher inexistente devuelve la respuesta estándar de recurso inexistente.
8. Se devuelve correctamente el nombre.
9. Se devuelve correctamente el color.
10. Se devuelve correctamente el logo cuando existe.
11. Los datos opcionales pueden ser `null`/ausentes.
12. El país se obtiene correctamente cuando existe.
13. El año de fundación se obtiene correctamente cuando existe.
14. El sitio web se obtiene correctamente cuando existe.
15. La descripción breve se obtiene correctamente cuando existe.
16. La historia se obtiene correctamente cuando existe.

### Contrato

17. El DTO no expone entidades de persistencia.
18. El DTO no expone información administrativa.
19. No se expone `StoragePath`.
20. La operación utiliza las abstracciones Repository/Service existentes.

Si alguno de los datos todavía no existe en el modelo actual, adaptar los tests al contrato real y dejar documentado el faltante.

---

## Restricciones

* No implementar Public Web.
* No modificar componentes React.
* No modificar el diseño UX/UI.
* No agregar funcionalidades de Publisher no solicitadas.
* No crear endpoints administrativos nuevos.
* No crear un endpoint anónimo.
* No utilizar `[AllowAnonymous]`.
* No eliminar ni modificar las restricciones de autenticación existentes.
* No reutilizar un DTO administrativo como contrato público del Public Web si contiene información que no corresponde exponer.
* No exponer `StoragePath`.
* No exponer entidades EF.
* No introducir una abstracción genérica de Repository.
* No duplicar consultas existentes sin necesidad.
* No introducir lógica de jerarquía de Works en este endpoint.
* No agregar todavía información de Franchise o Series al detalle del Publisher.
* No crear datos ficticios para completar el diseño.
* Identificadores y código en inglés.
* Mantener las reglas de arquitectura y coding rules existentes.

---

## Documentación que debe revisar el agente

Antes de implementar:

```text
backend-agent.md
project.md
backend-architecture.md
backend-stack-technology.md
backend-coding-rules.md

project/domain/domain.md
project/services.md
project/repositories.md
project/endpoints.md
```

Revisar además los catálogos específicos de Publisher cuando sean necesarios.

---

## Criterios de aceptación

### Endpoint

* Existe:

```http
GET /api/publishers/{id}
```

* El endpoint está destinado al Public Web.
* Requiere autenticación.
* No requiere rol `Administrator`.
* No admite acceso anónimo.
* Utiliza las convenciones de autenticación/autorización existentes.

### Datos

* La respuesta permite construir el header de Editorial.
* Se devuelve el nombre.
* Se devuelve el color.
* Se devuelve el logo cuando existe.
* Se devuelve el país cuando existe.
* Se devuelve el año de fundación cuando existe.
* Se devuelve el sitio web cuando existe.
* Se devuelve la descripción breve cuando existe.
* Se devuelve la historia cuando existe.
* Los datos opcionales pueden estar ausentes.

### Arquitectura

* Repository, Service y Endpoint respetan sus responsabilidades.
* No se expone ninguna entidad de persistencia.
* No se expone información administrativa.
* No se expone información interna de almacenamiento.
* No se produce N+1.
* Se utilizan las abstracciones existentes cuando corresponda.

### Documentación y pruebas

* La documentación queda actualizada.
* La documentación identifica explícitamente el endpoint como **Public Web autenticado**.
* Los tests cubren autenticación y autorización.
* Los tests cubren el contrato de datos.
* Build y tests pasan sin errores.
* No se modifican funcionalidades fuera del alcance de esta task.

## Resultado esperado

Public Web dispone de una única fuente de datos para construir el detalle de una Editorial mediante:

```http
GET /api/publishers/{id}
```

El endpoint es accesible únicamente por usuarios autenticados, no requiere `Administrator` y no expone información administrativa ni infraestructura interna.

La implementación queda preparada para que una task posterior implemente el header de Publisher en Public Web.

---

# Resultado de ejecución

## Qué se implementó

`GET /api/publishers/{id}` para la página `/publishers/:id` del Public Web, con detalle público del Publisher autenticado y sin rol `Administrator`.

Respuesta (`PublisherDetailDto`):

```json
{
  "id": 2,
  "name": "Zenescope",
  "color": "#0b3d91",
  "urlImage": "/images/100",
  "countryName": "United States",
  "foundedYear": 1999,
  "website": "https://www.zenescope.com",
  "description": "American comic book publisher.",
  "history": "Founded in Los Angeles in 1999..."
}
```

## Dominario revisado: no falta ningún dato

Se revisó `Domain/Entities/Publisher.cs`, `PublisherConfiguration` y `project/domain/domain-catalog.md` antes de escribir código. Los nueve campos del contrato objetivo tienen contraparte real en el dominio:

| Contrato de la Task | Dominio | Columna |
| --- | --- | --- |
| `Id` | `Publisher.Id` | PK |
| `Name` | `Name` | varchar(200), required |
| `Color` | `Color` | varchar(7) |
| `ImageUrl` | `Image` + `ImageUrlBuilder.ToUrl` | FK `ImageId`, opcional |
| `CountryName` | `Country.Name` / `GetCountryName()` | FK `CountryId`, opcional |
| `FoundationYear` | `FoundedYear` | `int?` |
| `Website` | `Website` | varchar(512) |
| `ShortDescription` | `Description` | varchar(1000) |
| `History` | `History` | text |

No se inventó ni se simuló ningún campo. No hay información faltante que reportar.

## Archivos nuevos

- `api/Application/DTOs/PublisherDetailDto.cs`
- `tests/Infrastructure.Tests/Integration/PublisherDetailContractTests.cs` (6 tests)
- `tests/Infrastructure.Tests/Integration/PublisherDetailIntegrationTests.cs` (7 tests)

## Archivos modificados

- `api/Application/Interfaces/IPublisherRepository.cs` — nueva operación `GetDetailByIdAsync`.
- `api/Infrastructure/Repositories/PublisherRepository.cs` — `GetDetailByIdAsync` con `AsNoTracking` + `Include` de Country e Image.
- `api/Application/Interfaces/IPublisherService.cs` — nueva operación `GetPublicDetailAsync`.
- `api/Application/Services/PublisherService.cs` — implementación y `using Application.Helpers`.
- `api/Api/Controllers/PublishersController.cs` — `[HttpGet("{id:long}")] GetById`.
- `project/endpoints/endpoints-publishers.md` — sección del detalle público.
- `project/services/services-catalog.md` — operación y comportamiento.
- `project/repositories/repositories-catalog.md` — `GetDetailByIdAsync` y su distinción con `GetByIdAsync`.

## Decisiones

### Nombres del contrato

Por decisión humana previa, se usan los nombres del dominio y no los del borrador de la Task: `foundedYear` (no `foundationYear`) y `description` (no `shortDescription`).

Además, la URL de la imagen se expone como `urlImage`, que es el nombre que ya usan `SeriesListItemDto`, `FranchiseListItemDto` y `AdminPublisherDetailDto`. Introducir `imageUrl` solo en este DTO habría creado una segunda convención para el mismo concepto. `imageUrl` no forma parte de la respuesta. Queda documentado en `endpoints-publishers.md` para que el Public Web tipee contra el contrato real.

### Editorial inactiva

Por decisión humana previa, una editorial con `IsActive = false` responde `404`, siguiendo la convención del proyecto. El mensaje es idéntico al de un id inexistente para no revelar la existencia de un recurso desactivado.

### Operation de Repository

`GetByIdAsync` existe pero es el read del camino de escritura: lo usan create/update/deactivate/activate, que mutan la entidad, y por eso mantiene change tracking y se apoya en lazy-loading proxies. Agregarle `AsNoTracking` habría cambiado el comportamiento de las escrituras.

Se agregó entonces `GetDetailByIdAsync`: lectura pura, `AsNoTracking`, una sola ida y vuelta, cargando solo `Country` e `Image`, que es exactamente lo que necesita el detalle público. Sin N+1 y sin grafo completo de entidad. El nombre no lleva "public": el Repository no debe conocer la audiencia.

### Contrato

- DTO nuevo y específico. No se reutilizó `AdminPublisherDetailDto`, que expone `IsAlive`, `IsFeatured`, `IsActive`, `CreatedAt`, `CountryId` e `ImageId`.
- El logo se construye con `ImageUrlBuilder.ToUrl`, el mecanismo existente, y se sirve por el endpoint de imágenes con sus reglas de acceso actuales. Nunca se expone `StoragePath`, `FileName` ni ruta física.
- `id <= 0` produce `ValidationException`, igual que el detalle administrativo.
- No se incluye jerarquía de Franchises ni Series, según el alcance de la Task. Esa información ya está disponible en `GET /api/franchises?publisherId=` y `GET /api/series?publisherId=`.
- Los siete datos opcionales son nulables y su ausencia no lanza excepción. No se generan placeholders.

## Tests

`PublisherDetailContractTests` (6) — `PublishersController` requiere `[Authorize]`, sin `AllowAnonymous` ni `Roles`; expone `GetById` en `api/publishers/{id:long}` con `(long id, CancellationToken)` y retorno `Task<IActionResult>`; la acción no es anónima; el DTO expone exactamente los nueve campos públicos; no expone `IsActive`, `IsFeatured`, `IsAlive`, `CreatedAt`, `CountryId`, `ImageId`, `StoragePath` ni `FileName`; y la URL de imagen sale del mecanismo de imágenes del proyecto.

`PublisherDetailIntegrationTests` (7), data-driven sobre la base de desarrollo, sin crear ni eliminar datos:

| Test | Cubre |
| --- | --- |
| `GetPublicDetail_ExistingPublisher_ReturnsItsPublicData` | nombre, color, website, description, history, foundedYear y país coinciden con la entidad |
| `GetPublicDetail_ExposesLogoUrlWhenImageExists` | `urlImage` es `/images/{id}` cuando hay logo, y null cuando no |
| `GetPublicDetail_OptionalDataCanBeAbsent` | datos opcionales ausentes no lanzan excepción y quedan en null |
| `GetPublicDetail_UnknownPublisher_ThrowsNotFound` | id inexistente produce `BusinessNotFoundException` (mapeado a 404 por el middleware) |
| `GetPublicDetail_NonPositiveId_ThrowsValidation` | `0` e id negativo producen `ValidationException` |
| `GetPublicDetail_InactivePublisher_ThrowsNotFound` | toda editorial inactiva produce `BusinessNotFoundException` |
| `GetPublicDetail_DoesNotExposeAdministrativeFields` | el contrato no filtra datos administrativos |

## Verificación

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores**. Solo los 2 warnings preexistentes (`ComicAnalysisParser.cs` CS8603 y `DesignTimeDbContextFactory.cs` CS8604).
- Tests nuevos: **13/13 en verde**.
- Suite completa: **146/146 en verde** con el output por defecto.

## Verificación pendiente de ejecución manual

Por decisión humana previa, la seguridad se valida por contrato de atributos y no por llamada HTTP, ya que el proyecto de tests no monta la API con `WebApplicationFactory`. Queda para prueba manual contra la API en ejecución:

1. Usuario anónimo a `GET /api/publishers/{id}` → 401.
2. Usuario autenticado sin rol Administrator → 200.
3. Usuario autenticado con rol Administrator → 200.
4. Id inexistente → 404 con el mensaje estándar.

## Criterios de aceptación

Endpoint: existe `GET /api/publishers/{id}`, requiere autenticación, no requiere `Administrator`, no admite anónimos y usa las convenciones existentes (`[Authorize]` sin roles en `PublishersController`, que no tiene `[AllowAnonymous]`).

Datos: la respuesta construye el header de Editorial; devuelve nombre, color, logo, país, año de fundación, sitio web, descripción e historia cuando existen; los opcionales pueden estar ausentes.

Arquitectura: Repository, Service y Endpoint respetan responsabilidades; no se expone ninguna entidad de persistencia, dato administrativo ni información de almacenamiento; no hay N+1; se reutilizaron `IPublisherService`, `IPublisherRepository`, `ImageUrlBuilder` y el helper de dominio `GetCountryName()`.

Documentación y pruebas: `endpoints-publishers.md`, `services-catalog.md` y `repositories-catalog.md` actualizados, con el endpoint identificado explícitamente como Public Web autenticado y sin usar "public" para acceso anónimo; 13 tests nuevos; build y suite completa en verde. No se modificó funcionalidad fuera del alcance.

## Impacto para el Public Web

Con esta Task, Public Web puede eliminar la fuente de datos provisional de la página de Editorial. El workaround de `works-page.tsx:193-201` de `TASK-PUBLIC-WEB-0061` sigue pendiente de eliminación en el lado del frontend, ya que esa Task ahora puede leer el publisher directamente de la opción de Serie.
