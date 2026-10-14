# TASK-API-0247 — Exponer Publisher en el detalle público de Franchise

**Assignee:** Agent

## Motivo

Detectado al terminar `TASK-PUBLIC-WEB-0066 — Mejorar detalle de Franchise`. El detalle público de una franquicia no incluye su editorial, así que el frontend no puede fijar el filtro de publisher en `/franchises/{id}` sin depender de que la franquicia tenga al menos una obra asociada.

Hoy el frontend resuelve el nodo de publisher pidiéndole una sola obra a `GET /api/works` y leyendo `works[0].publisher`. Con una franquicia sin obras eso devuelve una lista vacía, `contextEntity.publisher` queda `undefined` y la página queda sin filtro de editorial pese a estar en el contexto de una franquicia.

El frontend NO va a resolver esto con un workaround. Falta el dato en el contrato público, corresponde al backend exponerlo.

## Task de origen

`backlog/epic-03/us-0025/public-web/finished/TASK-PUBLIC-WEB-0066 — Mejorar detalle de Franchise.md`

## Trabajo solicitado

Agregar `PublisherId`, `PublisherName` y `PublisherColor` a `PublicFranchiseDetailDto`, de forma simétrica a como ya lo hace `FranchiseFilterDto`.

Archivos involucrados:

* `api/Application/DTOs/PublicFranchiseDetailDto.cs` — agregar los tres campos al record.
* `api/Application/Services/FranchiseService.cs` — completar la construcción del DTO en `GetPublicDetailAsync` (líneas 93-98), vía los helpers de dominio `GetPublisherId()`, `GetPublisherName()` y `Publisher.Color`.
* `api/Infrastructure/Repositories/FranchiseRepository.cs` — `GetDetailByIdAsync` (líneas 19-25) hoy sólo hace `.Include(f => f.Image)`. Agregar `.Include(f => f.Publisher)`, que es lo que hace falta para que la navegación esté cargada. Es la única consulta de detalle, no un listado, así que no hay riesgo de N+1.
* `project/endpoints/endpoints-franchises.md` — actualizar la forma de la respuesta y la nota que hoy dice que el publisher "no es parte de este payload".

## Contexto necesario

El record actual:

```csharp
public record PublicFranchiseDetailDto(
    long Id,
    string Name,
    string? Description,
    string? Color,
    string? UrlImage);
```

`FranchiseFilterDto` ya expone el equivalente y es la referencia a seguir:

```csharp
public record FranchiseFilterDto(
    long Id,
    string Name,
    string? Color,
    long? PublisherId,
    string? PublisherName);
```

La entidad de dominio ya tiene los helpers, no hace falta agregarlos:

```csharp
public long? GetPublisherId() => this.Publisher != null ? this.Publisher.Id : null;
public string? GetPublisherName() => this.Publisher != null ? this.Publisher.Name : null;
```

`Franchise.Publisher` está declarado como no nulable (`public virtual Publisher Publisher { get; set; } = null!;`) pero las navegaciones lazy no se cargan sin `Include`, y los helpers ya contemplan el null. Por eso los tres campos nuevos deben ser **nulables**, y una franquicia sin publisher debe devolverlos en `null` sin excepción, en lugar de lanzar.

`FranchiseFilterDto` no expone color de publisher. Se pide `PublisherColor` además porque el Public Web usa el color de la editorial para el pill de Editorial del autocomplete y para el encuadre de la jerarquía; con sólo `PublisherId` el frontend tendría que hacer una segunda request para resolverlo. Si se prefiere no ampliar el contrato, al menos `PublisherId` y `PublisherName` son indispensables y `PublisherColor` puede quedar fuera, pero entonces conviene documentarlo.

## Impacto en el frontend

`features/catalog/types/works.ts` — `FranchiseDetailDto` suma los campos nuevos.
`features/catalog/pages/context-page.tsx` — `FranchiseNode.publisherId` deja de ser `number | null` cuando el endpoint responda, y el nodo de publisher de la página de franchise sale del detalle en lugar de derivarse de la primera obra.

`FranchiseNode.publisherId` está tipado `number | null` justamente porque hoy no hay de dónde sacarlo. Al cerrar esta tarea, el frontend puede volver a tiparlo como obligatorio y eliminar la rama que resuelve el publisher a partir de `works[0]`.

## Dependencias conocidas

Ninguna. Es una extensión aditiva de un DTO público existente, igual que lo fue `TASK-API-0244` para `SeriesFilterDto`. Agregar campos a la respuesta es compatible con los clientes actuales. No cambia request, filtros, paginación ni el contrato administrativo.

## Resultado esperado

`GET /api/franchises/{id}` devuelve, además de `id`, `name`, `description`, `color` y `urlImage`, los campos `publisherId`, `publisherName` y `publisherColor`.

Ejemplo esperado:

```json
{
  "id": 6,
  "name": "Spiderman",
  "description": null,
  "color": "#f10d04",
  "urlImage": "/images/748",
  "publisherId": 3,
  "publisherName": "Marvel Comics",
  "publisherColor": "#f51b00"
}
```

## Criterios de aceptación

* `PublicFranchiseDetailDto` incluye `PublisherId`, `PublisherName` y `PublisherColor`, los tres nulables.
* `FranchiseService.GetPublicDetailAsync` los resuelve vía `GetPublisherId()`, `GetPublisherName()` y `Publisher.Color`.
* `FranchiseRepository.GetDetailByIdAsync` carga la navegación `Publisher`.
* Una franquicia sin publisher devuelve los tres campos en `null`, sin excepción.
* `GET /api/franchises/{id}` responde con los campos nuevos, y el 404 de una franquicia inexistente o inactiva y el 422 de `id <= 0` se mantienen iguales.
* `endpoints-franchises.md` refleja la nueva forma de la respuesta.
* Tests de integración que cubran los campos nuevos y el caso sin publisher, siguiendo el patrón de `CatalogFilterEndpointsIntegrationTests` y `PublisherDetailIntegrationTests`.
* El build del backend finaliza correctamente.

## Notas

Requiere aprobación humana (`planned` -> `pending`) antes de ser ejecutada.

Datos de referencia tomados de la base de desarrollo: Spiderman es id 6 y su publisher es Marvel Comics id 3, con color `#f51b00`; Batman es id 5 y su publisher es DC Comics id 5.

---

# Resultado de ejecución

## Qué se implementó

`PublicFranchiseDetailDto` suma `PublisherId`, `PublisherName` y `PublisherColor`. `GET /api/franchises/{id}` devuelve ahora:

```json
{
  "id": 6,
  "name": "Spiderman",
  "description": null,
  "color": "#f10d04",
  "urlImage": "/images/748",
  "publisherId": 3,
  "publisherName": "Marvel Comics",
  "publisherColor": "#f51b00"
}
```

Extensión aditiva pura: no cambian request, filtros, paginación, el contrato administrativo ni los códigos de respuesta. El `404` de franchises inexistente o inactiva y el `422` de `id <= 0` se mantienen idénticos.

## Corrección a la Task: el criterio de "franquicia sin publisher" es inalcanzable

La Task pedía, como criterio de aceptación, que "una franquicia sin publisher devuelva los tres campos en `null`, sin excepción". Ese estado **no existe en el modelo de datos**.

`FranchiseConfiguration.cs:39-43` declara la relación con `Publisher` como `.HasForeignKey("PublisherId").OnDelete(DeleteBehavior.Restrict).IsRequired()`. `PublisherId` es una FK obligatoria, y `Restrict` impide además borrar una editorial con franquicias asociadas. Toda fila de `Franchises` tiene editorial.

Consecuencia práctica: un test de integración data-driven que buscara "una franquicia sin publisher" no encontraría nunca una fila, y pasaría sin verificar nada. Es un test vacuo, que es peor que no tener test porque da confianza falsa.

Los tres campos se mantienen **nulables** porque así lo pide la Task y porque es la convención de `FranchiseFilterDto` (`long? PublisherId`). El mapeo es defensivo con `GetPublisherId()`, `GetPublisherName()` y `Publisher?.Color`, todos null-safe. Pero el criterio se verificó de otra forma:

- `FranchiseDomainHelpers_ReturnNullWhenPublisherIsNotLoaded` (contrato): construye un `Franchise` sin `Publisher` cargado y verifica que los tres mecanismos devuelven `null` sin excepción. Es determinista y no depende de la base.
- `PublicFranchiseDetailDto_AcceptsNullPublisherWithoutThrowing` (contrato): construye el DTO con los tres campos en `null` y verifica que los propaga.
- `PublicFranchiseDetailDto_PublisherFieldsAreNullable` (contrato): verifica que `PublisherId` es `long?`.

En la base real, `ResolvesThePublisherFields` verifica lo contrario, que es lo que de hecho ocurre: toda franchise de la base tiene editorial y los tres campos quedan poblados.

## Archivos modificados

- `api/Application/DTOs/PublicFranchiseDetailDto.cs` — tres campos nuevos.
- `api/Application/Services/FranchiseService.cs` — mapeo de los tres campos en `GetPublicDetailAsync`.
- `api/Infrastructure/Repositories/FranchiseRepository.cs` — `GetDetailByIdAsync` agrega `.Include(f => f.Publisher)`.
- `tests/Infrastructure.Tests/Integration/FranchiseDetailContractTests.cs` — lista exacta de campos actualizada a 8, `PublisherId` deja de estar prohibido como dato administrativo, y 3 tests nuevos.
- `tests/Infrastructure.Tests/Integration/FranchiseDetailIntegrationTests.cs` — 2 tests nuevos.
- `project/endpoints/endpoints-franchises.md` — respuesta y notas actualizadas.
- `project/repositories/repositories-catalog.md` — `GetDetailByIdAsync` ahora carga `Image` y `Publisher`.
- `project/services/services-catalog.md` — operación y comportamiento.

## Corrección necesaria en los tests de 0246

Dos tests de `FranchiseDetailContractTests` eran incompatibles con el contrato nuevo y fallaban por diseño, no por un error de implementación:

- `ExposesOnlyPublicFields` afirmaba la lista exacta de 5 campos; ahora son 8.
- `DoesNotExposeAdminOrStorageData` afirmaba `DoesNotContain("PublisherId")`. `PublisherId` ya no es un dato administrativo: es el mismo campo que `FranchiseFilterDto` ya expone públicamente. Se eliminó esa prohibición y se compensó verificando que `PublisherCountryName` y `ImageId` sigan ausentes.

Esto es el costo esperado de un contrato público aditivo: los tests que congelan la forma exacta del payload hay que actualizarlos a propósito, no por accidente.

## Tests

5 tests nuevos (3 de contrato, 2 de integración):

| Test | Cubre |
| --- | --- |
| `ResolvesThePublisherFields` | los tres campos coinciden con la entidad cargada, y toda franchise tiene editorial |
| `PublisherFieldsMatchTheCatalogFilter` | `publisherId`/`publisherName` coinciden con lo que devuelve `GET /api/franchises` |
| `PublisherFieldsAreNullable` | `PublisherId` es `long?` |
| `AcceptsNullPublisherWithoutThrowing` | el DTO propaga los tres campos en null |
| `FranchiseDomainHelpers_ReturnNullWhenPublisherIsNotLoaded` | los helpers de dominio y `Publisher?.Color` devuelven null sin excepción |

`PublisherFieldsMatchTheCatalogFilter` es el test que ata las dos piezas: el detalle y el listado no pueden divergir sobre la editorial de una franchise.

## Verificación

- Build: **0 errores** (2 warnings preexistentes: `ComicAnalysisParser.cs` CS8603 y `DesignTimeDbContextFactory.cs` CS8604).
- Tests nuevos: **21/21** en verde en el filtro `FranchiseDetail`.
- Suite completa: **167/167 en verde** (162 previos + 5 nuevos).

### Nota de proceso: no se detuvo la API

Había una instancia de la API en ejecución (PID 34560, 42 minutos de uptime, con la que el usuario estaba probando a mano). En lugar de terminarla para liberar las DLL bloqueadas, se compiló y ejecutó con `--artifacts-path` apuntando a un directorio temporal, con build y tests separados de los archivos que la API tiene abiertos. La API nunca se detuvo.

Con `--artifacts-path` los tres tests de workflow fallaron al principio con `FileNotFoundException`. No era un efecto del cambio: esos tests resuelven sus assets con rutas relativas a `AppContext.BaseDirectory` (`FullWorkflowIntegrationTests.cs:36-38`, tres y cuatro niveles hacia arriba), que apuntan al proyecto de tests en el layout normal y al directorio temporal en este layout. Se copiaron los assets al path equivalente y la suite quedó en verde. Los assets del repositorio no se tocaron.
