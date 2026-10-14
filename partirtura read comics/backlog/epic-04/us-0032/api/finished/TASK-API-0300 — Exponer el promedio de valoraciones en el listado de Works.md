# TASK-API-0300 — Exponer el promedio de valoraciones en el listado de Works

## Assignee

Agent (Backend/API)

## Origen

TASK-PUBLIC-WEB-0086 — Implementar sección Recomendados del catálogo (Public Web).

## Motivo

La sección **Recomendados del catálogo** del index debe mostrar, en cada tarjeta, el promedio real de
estrellas del Work cuando existan valoraciones. El endpoint que alimenta esa sección
(`GET /api/works/recommended`) devuelve `WorkCatalogItemDto`, el mismo DTO del catálogo, y ese DTO
**no contiene** `averageRating` ni `ratingCount`.

Hoy el promedio sólo está disponible en `GET /api/works/{id}` (detalle), por lo que mostrarlo desde el
listado exigiría una consulta por obra (N+1), que la tarea de Front prohíbe explícitamente.

## Trabajo solicitado

Incorporar el promedio de valoraciones al contrato del listado, respetando las reglas existentes de
`WorkRating` (sólo valoraciones activas, votos de cero estrellas incluidos en el promedio).

Opciones, a elección del agente de Backend según el contrato actual:

1. Agregar `averageRating` (y, si aplica, `ratingCount`) a `WorkCatalogItemDto`, de modo que
   `GET /api/works` y `GET /api/works/recommended` ambos lo devuelvan.
2. O crear un DTO específico del listado de recomendados que los incluya, si compartir el DTO del
   catálogo tiene impacto no deseado.

Debe resolverse en la misma consulta del listado (subconsulta correlacionada o `LEFT JOIN` con
agrupación), sin consultas adicionales por obra y sin cargar el catálogo para calcular en memoria.

## Resultado esperado

- `averageRating: number | null` disponible por obra en el listado de recomendados (y en el catálogo si
  se opta por la opción 1).
- `null` cuando la obra no tenga valoraciones activas; el promedio real cuando las tenga.
- Una sola consulta; sin N+1.

## Información necesaria

- Contrato actual: `project/endpoints/endpoints-recommended-works.md` y
  `project/endpoints/endpoints-works.md`.
- DTO: `Application/DTOs/WorkCatalogDtos.cs` (`WorkCatalogItemDto`), mapeo en
  `Application/Helpers/WorkCardMapper.cs`.
- Reglas de valoración: US-0030 / TASK-API-0288 y siguientes.
- El front ya está preparado para consumir el campo sin más cambios que pasarlo en el mapeo.

## Dependencias conocidas

- `GET /api/works/recommended` y `WorkCardMapper` (TASK-API-0299), ya implementados.

## Criterios de aceptación

- El listado de recomendados incluye el promedio por obra.
- El promedio respeta valoraciones activas e incluye votos de cero estrellas.
- Obras sin valoraciones devuelven `null`, no un valor ficticio.
- No hay consultas individuales por obra ni carga del catálogo completo.
- `repositories.md`, `services.md` y `endpoints.md` quedan actualizados.
- Pruebas que cubran obras con valoraciones, sin valoraciones y con voto de cero estrellas.

---

## Resultado de ejecución

### Archivos modificados
- `api/Application/DTOs/WorkCatalogDtos.cs` — `WorkCatalogItemDto` gana `double? AverageRating` (última posición).
- `api/Application/Helpers/WorkCardMapper.cs` — `ToCard` mapea `AverageRating` con el nuevo helper `ToAverageRating`.
- `tests/Infrastructure.Tests/Integration/WorkCardAverageRatingIntegrationTests.cs` (nuevo) — 4 tests.
- `project/domain.md` — índice de dominio corregido (ver más abajo).
- `project/services.md` (fila de `WorkCardMapper`) y `project/services/services-catalog.md` (contratos de historial y recomendados).
- `project/endpoints/endpoints-works.md`, `endpoints-recommended-works.md`, `endpoints-reading-history.md` — campo, ejemplos y notas.

### Implementación realizada
- **Opción 1 de la task**: se agregó `averageRating` al `WorkCatalogItemDto` compartido, por lo que `GET /api/works`, `GET /api/works/recommended` y `GET /api/users/me/reading-history` lo devuelven sin cambios de firmas ni consultas nuevas.
- **Origen del valor**: los acumuladores de la entidad `Work` (`RatingCount` / `AverageRating`), la misma fuente que ya usa el detalle (`GET /api/works/{id}`): `WorkCardMapper.ToAverageRating(work)` devuelve `work.AverageRating` cuando `work.RatingCount > 0` y `null` cuando la obra no tiene valoraciones. Los acumuladores se mantienen en cada voto (`WorkRatingService`, TASK-API-0290/0294), consideran solo valoraciones activas e incluyen los votos de cero estrellas.
- **Costo**: cero consultas adicionales. El promedio viaja en la misma fila de `Works` que ya traen las tres consultas de listado; no hay subconsultas, `LEFT JOIN` ni carga del catálogo. Los acumuladores de todas las obras fueron reconciliados contra las valoraciones activas durante TASK-API-0299.
- **Impacto en otros consumidores**: solo el historial de lectura y el catálogo comparten el DTO; ambos lo exponen de forma consistente. El detalle ya tenía el campo (no se modificó su ejemplo).

### Decisiones tomadas
- Reutilizar los acumuladores en lugar de una subconsulta correlacionada sobre `WorkRating` (opción señalada por el usuario: "el work tiene average"): mismo valor que el detalle, cero costo y una sola fuente de verdad. El `null` se deriva de `RatingCount > 0`, cumpliendo "obras sin valoraciones devuelven null".
- No se agregó `ratingCount` al listado: la task lo marca como opcional y el front solo necesita el promedio; el detalle ya expone ambos.

### Validaciones ejecutadas
- ✅ Compilación: 0 errores.
- ✅ Suite completa: **358/358** (354 + 4 nuevos).
- ✅ Tests nuevos: catálogo con obra valorada (4.5), obra con voto de 0 estrellas (0, no null) y obra sin valoraciones (null); recomendados con los tres casos; historial sin romperse; y un test que compara el `averageRating` de **cada** obra del catálogo contra el promedio recalculado desde `WorkRating` activas en la base (oráculo independiente de los acumuladores).
- ✅ Sin consultas por obra: `ChangeTracker` vacío tras las llamadas del servicio (no hay lazy loading) y el valor viaja en la consulta existente.
- ✅ Smoke test HTTP real: `sortBy=MostRated` devuelve promedios 5, 5, 5, 4.5, 3, **0** (voto de 0 estrellas) y `null` para las obras sin votos; el catálogo devuelve `null` donde corresponde; el detalle sigue coherente (5 / 1 voto).

### Revisión de `project/domain.md` (solicitada por el usuario)
El índice estaba desactualizado; corregido y documentado en una nota de auditoría 2026-10:
- `Number` y `GraphicNovel` **ya no existen**: `Work` es una entidad única no abstracta con `NumberValue` y `WorkType`. Se eliminaron del diagrama y de la tabla de relaciones (incluida la herencia TPH incorrecta).
- `WorkReadingProgress` faltaba por completo en el diagrama y en las relaciones clave (se agregaron `User` ↔ y `Work` ↔).
- Faltaban los nodos `ListType`, `WorkList`, `WorkListItem` y las relaciones `Work` → `WorkType`/`Series`/`Franchise`/`Publisher`.
- La única herencia TPH del modelo es `File` → `Image` (discriminator `FileType`).
