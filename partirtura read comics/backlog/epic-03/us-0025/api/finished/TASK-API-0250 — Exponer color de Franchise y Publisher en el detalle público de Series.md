# TASK-API-0250 — Exponer color de Franchise y Publisher en el detalle público de Series

**Assignee:** Agent

## Motivo

Detectado al necesitar cerrar `TASK-PUBLIC-WEB-0067 — Mejorar header de Series`.

El usuario corrigió el requerimiento: en el header de `/series/{id}` se esperan **tres pills**, no un link de texto:

```text
[Imagen] (Serie) (Franquicia) (Editorial)
```

Cada pill con su propio color: la pill `Serie` con `series.color`, la pill `Franquicia` con `franchise.color` y la pill `Editorial` con `publisher.color`.

Hoy `PublicSeriesNodeDto` expone únicamente `Id` y `Name`:

```csharp
public record PublicSeriesNodeDto(
    long Id,
    string Name);
```

`endpoints-series.md` lo documenta explícitamente: *"Los nodos `franchise` y `publisher` exponen únicamente `Id` y `Name`. No incluyen `Color`, a diferencia del `WorkCatalogNodeDto` del catálogo de obras, para no exponer campos que la página no necesita."*

Esa decisión era correcta cuando el frontend los mostraba como links de texto. Con el requerimiento actualizado, la página **sí** necesita el color. El frontend NO va a inventar un color de fallback ni a hacer una segunda request por nodo para resolverlo: corresponde al backend exponerlo.

## Task de origen

`backlog/epic-03/us-0025/public-web/pending/TASK-PUBLIC-WEB-0067 — Mejorar header de Series.md`

## Trabajo solicitado

Agregar `Color` a `PublicSeriesNodeDto`, de forma simétrica a como ya lo hace `WorkCatalogNodeDto` del catálogo de obras.

Archivos involucrados:

* `api/Application/DTOs/PublicSeriesDetailDto.cs` — agregar `string? Color` a `PublicSeriesNodeDto`.
* `api/Application/Services/SeriesService.cs` — `GetPublicDetailAsync` completa los nodos con `series.Franchise.Color` y `series.Franchise.Publisher.Color`, con acceso null-safe.
* `project/endpoints/endpoints-series.md` — actualizar la forma de la respuesta y **revertir** la nota que hoy excluye `Color` de los nodos, explicando que ahora se incluye porque la página lo consume.

`SeriesRepository.GetDetailByIdAsync` **no necesita cambios**: ya hace `.Include(s => s.Franchise).ThenInclude(f => f.Publisher)`, así que ambos colores están disponibles en la única consulta de detalle. No hay riesgo de N+1.

## Contexto necesario

La referencia a seguir es `WorkCatalogNodeDto`, que ya expone el triaje completo por nodo:

```csharp
public record WorkCatalogNodeDto(
    long Id,
    string Name,
    string? Color);
```

`Color` debe ser **nulable**: es el mismo criterio de `PublicFranchiseDetailDto.PublisherColor` y de `SeriesFilterDto.Color`. Ninguna entidad garantiza que el color esté seteado, y un color ausente debe producir una pill con el tratamiento de fallback que ya existe en el frontend, no un error.

El acceso en el service debe ser null-safe porque las navegaciones lazy no siempre están cargadas:

```csharp
PublicSeriesNodeDto? franchise = series.Franchise is null
    ? null
    : new PublicSeriesNodeDto(series.Franchise.Id, series.Franchise.Name, series.Franchise.Color);

PublicSeriesNodeDto? publisher = series.Franchise?.Publisher is null
    ? null
    : new PublicSeriesNodeDto(
        series.Franchise.Publisher.Id,
        series.Franchise.Publisher.Name,
        series.Franchise.Publisher.Color);
```

## Impacto en el frontend

`features/catalog/types/works.ts` — `EntityNodeDto` suma `color: string | null`.

`features/catalog/components/entity-header.tsx` — las pills de `ancestors` pasan a ser pills coloreadas en lugar de links de texto, reutilizando el mismo criterio de luminancia (`readableAccentColor`) y el mismo alpha `0.85` de fondo que la pill principal. Franchise y Publisher navegación a `/franchises/{id}` y `/publishers/{id}` se conserva.

## Dependencias conocidas

Ninguna. Extensión aditiva de un DTO público existente, igual que `TASK-API-0244` para `SeriesFilterDto` y `TASK-API-0247` para `PublicFranchiseDetailDto`. Agregar un campo a la respuesta es compatible con los clientes actuales.

## Resultado esperado

`GET /api/series/{id}` devuelve los nodos con color:

```json
{
  "id": 7,
  "name": "Fly Vol.1",
  "description": null,
  "color": "#40373f",
  "urlImage": "/images/123",
  "franchise": {
    "id": 4,
    "name": "Fly",
    "color": "#f10d04"
  },
  "publisher": {
    "id": 4,
    "name": "Zenescope",
    "color": "#FF0000"
  }
}
```

## Criterios de aceptación

* `PublicSeriesNodeDto` incluye `Color`, nulable.
* `SeriesService.GetPublicDetailAsync` puebla el color de ambos nodos con acceso null-safe.
* `SeriesRepository.GetDetailByIdAsync` sigue resolviendo `Franchise` y `Publisher` sin consultas adicionales.
* Una serie sin franchise o sin publisher sigue devolviendo `null` en el nodo, sin excepción.
* `GET /api/series/{id}` responde con los colores; el `404` de serie inexistente o inactiva y el `422` de `id <= 0` se mantienen idénticos.
* `endpoints-series.md` refleja la nueva forma de la respuesta y ya no afirma que los nodos excluyen `Color`.
* Los tests de contrato de `PublicSeriesDetailDto` se actualizan a la nueva lista de campos y se agregan los que cubren el color de los nodos y el caso sin navegación cargada.
* El build del backend finaliza correctamente.

## Notas

Requiere aprobación humana (`planned` -> `pending`) antes de ser ejecutada.

Datos de referencia tomados de la base de desarrollo: `/api/series/7` es `Fly Vol.1` con color `#40373f`, franchise 4 (`Fly`) y publisher 4 (`Zenescope`). `/api/series/6` es `New X-men` con color `#020601`.
---

# Revisión de la Task antes de ejecutarla

La Task estaba bien fundamentada técnicamente. Se verificó cada afirmación contra el código:

| Afirmación | Veredicto |
| --- | --- |
| `PublicSeriesNodeDto` expone solo `Id` y `Name` | Confirmado |
| `endpoints-series.md` afirma que los nodos excluyen `Color` | Confirmado, con la cita literal |
| `GetDetailByIdAsync` ya incluye `Franchise` y `Publisher`, sin cambios necesarios | Confirmado |
| El código propuesto de acceso null-safe compila | Confirmado, sin warnings |

La Task es un giro de 180 grados respecto de una decisión documentada hace media hora en`TASK-API-0249`, y eso es legítimo: el requerimiento del frontend cambió de links de texto a pills coloreadas. La propia Task lo reconoce y pide explícitamente revertir la nota, en lugar de dejar dos documentos en contradicción.

**Un dato de referencia está mal.** Las notas dicen que `/api/series/7` es `Fly Vol.1` con color `#40373f`. Los nombres y los ids de franchise y publisher son correctos, pero el color no: se comprobó contra la base de desarrollo y es `#00B4D8`. El ejemplo JSON de la Task también da `#FF0000` para el color de Zenescope, cuando el real es `#231f20`.

No bloquea la implementación, porque los tests son data-driven y no fijan ids ni colores. Pero la documentación se escribió con los valores reales para no arrastrar el error.

Datos verificados en `comiclibrary_dev`:

```text
serie 5: X-men        color #f9a719  franchise 3 X-men #990e14       publisher 3 Marvel Comics #f51b00
serie 6: New X-men    color #020601  franchise 3 X-men #990e14       publisher 3 Marvel Comics #f51b00
serie 7: Fly Vol.1    color #00B4D8  franchise 4 Fly    #7209B7       publisher 4 Zenescope    #231f20
```

# Resultado de ejecución

## Qué se implementó

`PublicSeriesNodeDto` ahora incluye `Color`. `GET /api/series/{id}` devuelve:

```json
{
  "id": 7,
  "name": "Fly Vol.1",
  "description": "Sigue a Eddie, Chloe y Francis, adolescentes cuyas vidas cambian al descubrir una sustancia que les permite volar.",
  "color": "#00B4D8",
  "urlImage": "/images/123",
  "franchise": { "id": 4, "name": "Fly", "color": "#7209B7" },
  "publisher": { "id": 4, "name": "Zenescope", "color": "#231f20" }
}
```

Extensión aditiva pura: no cambia request, filtros, paginación, el contrato administrativo ni los códigos de respuesta. El `404` de serie inexistente o inactiva y el `422` de `id <= 0` quedan idénticos.

## Archivos modificados

- `api/Application/DTOs/PublicSeriesDetailDto.cs` — `string? Color` en `PublicSeriesNodeDto`.
- `api/Application/Services/SeriesService.cs` — ambos nodos se construyen con el color de su entidad.
- `tests/Infrastructure.Tests/Integration/SeriesDetailContractTests.cs` — lista de campos del nodo actualizada y un test nuevo.
- `tests/Infrastructure.Tests/Integration/SeriesDetailIntegrationTests.cs` — el color de los nodos se contrasta contra la entidad.
- `project/endpoints/endpoints-series.md` — respuesta, DTO y la nota revertida.
- `project/services/services-catalog.md` — nota del contrato.

`SeriesRepository.GetDetailByIdAsync` sin cambios, tal como anticipaba la Task: los colores son columnas escalares de Franchise y Publisher, que ya llegan cargadas por el `Include` existente. No hay consulta adicional.

## Decisiones

### Los nodos se quedan en un tipo propio, no se fusiona con `WorkCatalogNodeDto`

Ahora `PublicSeriesNodeDto` y `WorkCatalogNodeDto` tienen exactamente la misma forma: `(Id, Name, Color)`. La tentación obvious es borrar el primero y reutilizar el segundo.

No se hizo. `WorkCatalogNodeDto` pertenece al contrato del catálogo de obras (`GET /api/works`), con su propia documentación y sus tests. Reutilizarlo ataría el detalle de series al contrato de obras: cualquier cambio futuro en uno rompería el otro, y el nombre del tipo seguiría siendo engañoso fuera de su contexto. La duplicación de tres campos es más barata que ese acoplamiento.

Si más adelante hay un tercer consumidor de nodos `(Id, Name, Color)`, ahí sí conviene extraer un tipo común. Con dos, no.

### `Color` nullable

Ninguna entidad garantiza el color: `Series.Color`, `Franchise.Color` y `Publisher.Color` son las tres columnas nullable. Un color ausente produce el fallback del frontend, no un error, que es el criterio que ya usa `SeriesFilterDto.Color` y `PublicFranchiseDetailDto.PublisherColor`.

## Un hallazgo que la Task no menciona

`SeriesFilterDto` **no** expone `franchiseColor` ni `publisherColor`. Se intentó agregar esa comprobación cruzada a los tests y el compilador la rechazó.

Consecuencia práctica: el detalle de serie y el listado no se pueden contrastar por color, solo por id y nombre. Si el autocomplete del catálogo de Public Web quiere pintar las pills de franchises y publishers con su color, ese dato no está en `GET /api/series` y falta una task para agregarlo. Queda anotado en `endpoints-series.md`.

El criterio de "consistencia entre detalle y listado" de `TASK-API-0249` queda entonces cubiertos para ids y nombres, y con una limitación conocida para colores.

## Criterio "sin navegación cargada": no es alcanzable con datos

La Task pide cubrir "una serie sin franchise o sin publisher". Como en `TASK-API-0247`, ese estado no existe: `Series.FranchiseId` y `Franchise.PublisherId` son ambas claves foráneas obligatorias.

El acceso null-safe se mantiene igual, y el caso se cubre de forma determinista en `PublicSeriesNodeDto_AcceptsNullNodesWithoutThrowing`, que construye nodos con color, nodos sin color y un `PublicSeriesDetailDto` con ambos nodos en `null`. Es un test real del criterio, a diferencia de uno data-driven que nunca encontraría la fila.

## Tests

- `PublicSeriesNodeDto_ExposesIdNameAndNullableColor` — el nodo expone `Id`, `Name` y `Color`, y `Color` es `string?`.
- `PublicSeriesNodeDto_AcceptsNullNodesWithoutThrowing` — nodos con y sin color, y detalle con nodos nulos.
- `GetPublicDetail_ReturnsFranchiseIdAndName` y `GetPublicDetail_ReturnsPublisherIdAndName` — ahora además contrastan el color contra la entidad.

El contrato que congela la lista de campos del nodo pasó de 2 a 3 campos, así que ese test se actualizó a propósito.

## Verificación

- Build: **0 errores**.
- Tests del área: **21/21** en verde.
- Suite completa: **196/196 en verde** (195 previos + 1 nuevo; los demás tests se modificaron, no se agregaron).

## Verificación pendiente de ejecución manual

Igual que en las tasks anteriores, la seguridad se valida por contrato de atributos. Queda para prueba manual: anónimo → 401, autenticado → 200, administrador → 200, id inexistente → 404.
