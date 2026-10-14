# TASK-DASH-0093 — Adaptar listado general de Works y edición contextual

## Objetivo

Adaptar el listado general de `Work` para utilizar la nueva entidad unificada y garantizar que cualquier `Work` pueda editarse desde cualquier listado sin perder su dependencia real.

El listado general debe representar todos los Works independientemente de su contexto:

* Publisher
* Franchise
* Series
* sin dependencia contextual, si el modelo lo permite

## Documentación

Antes de comenzar, leer:

* `project/project.md`
* `project/communication.md`
* `project/dashboard-architecture.md`
* `project/frontend-dashboard-stack-technology.md`
* `project/frontend-dashboard-agent.md`
* `project/frontend-coding-rules.md`
* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar además las implementaciones actuales de los listados de Works de Publisher, Franchise y Series.

Al finalizar, actualizar únicamente:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Mantener la arquitectura actual del Dashboard:

* Page para composición y estado de alto nivel.
* Componentes para presentación y comportamiento visual específico.
* Service para comunicación con API.
* No realizar HTTP desde componentes visuales.
* Reutilizar componentes existentes.
* No duplicar lógica ya implementada para los listados contextuales.

## Listado general

El listado general debe utilizar:

```text
GET /api/admin-works
```

Este endpoint representa el catálogo general de Works y no debe recibir un contexto obligatorio de Publisher, Franchise o Series.

Debe mantener las funcionalidades disponibles en el listado:

* búsqueda;
* filtros;
* ordenamiento;
* paginación;
* loading;
* manejo de errores;
* edición.

El listado general **no debe mostrar un botón de creación**.

La creación de Works se realiza desde los listados contextuales correspondientes.

## Modelo

El listado debe trabajar exclusivamente con `Work`.

Eliminar cualquier dependencia conceptual de:

* `Number`;
* `GraphicNovel`;
* formularios específicos de esos tipos.

No implementar lógica basada en `WorkType`.

`WorkType` es únicamente una clasificación del Work.

## Edición

La edición debe poder iniciarse desde:

* listado general;
* listado de Publisher;
* listado de Franchise;
* listado de Series.

Todos deben navegar al mismo `WorkForm`.

El frontend no debe decidir cuál es la dependencia del Work basándose en el listado desde el cual se inició la edición.

La información de contexto debe provenir del backend al obtener el Work.

Por lo tanto:

```text
Work → Backend → contexto real → WorkForm
```

y no:

```text
Listado → contexto asumido → WorkForm
```

El `WorkForm` debe preservar durante la edición:

* `PublisherId`;
* `FranchiseId`;
* `SeriesId`;

según corresponda al Work recibido.

Si una dependencia es `null`, debe permanecer `null`.

No trasladar ni reconstruir la dependencia a partir de la URL actual.

## Formulario

Reutilizar el `WorkForm` implementado en `TASK-DASH-0089`.

No crear variantes del formulario para:

* Publisher;
* Franchise;
* Series;
* WorkType;
* Number;
* GraphicNovel.

El mismo formulario debe funcionar para creación y edición.

## Navegación

La navegación de edición debe ser independiente del contexto desde el cual se inició.

Ejemplo:

```text
Works de Series
    ↓ editar
WorkForm
    ↓ obtener Work
Backend informa SeriesId
    ↓
editar
```

El mismo Work debe poder ser editado posteriormente desde:

```text
Works general
Works de Publisher
Works de Franchise
Works de Series
```

sin cambiar su dependencia.

## Reutilización

Reutilizar:

* componentes de tablas;
* búsqueda;
* filtros;
* ordenamiento;
* paginación;
* acciones;
* navegación;
* `WorkForm`;
* services existentes.

No duplicar componentes ni lógica entre los cuatro listados.

## Validación

Verificar:

1. El listado general utiliza `/api/admin-works`.
2. El listado general muestra todos los Works correspondientes al catálogo.
3. El listado general no tiene acción de creación.
4. El listado general permite editar.
5. Publisher permite editar.
6. Franchise permite editar.
7. Series permite editar.
8. Los cuatro listados utilizan el mismo `WorkForm`.
9. La edición obtiene el Work desde backend.
10. La dependencia real del Work proviene del backend.
11. La edición no pierde `PublisherId`.
12. La edición no pierde `FranchiseId`.
13. La edición no pierde `SeriesId`.
14. Los valores `null` se preservan correctamente.
15. No existe inferencia de contexto basada en la pantalla desde la cual se abrió el Work.
16. No existe lógica basada en `WorkType`.
17. No quedan dependencias funcionales de los antiguos formularios de Number o GraphicNovel.
18. TypeScript compila correctamente.
19. Vite compila correctamente.
20. La implementación respeta la arquitectura del Dashboard.

---

## Resultado de ejecución

### Estado: Finished

### Archivos modificados
- `pages/works-page.tsx` — Adaptado al modelo unificado de Work: filtro por `workTypeId` con `getWorkTypes`, acciones unificadas (`deactivateWork`/`activateWork`/`getWorkContentStatus`/`retryWorkContent`), navegación a `/works/:id/edit`, sin botón de creación.
- `app/router/routes.tsx` — Rutas de Works unificadas: `/works`, `/works/create`, `/works/:workId/edit`.
- `project/pages.md` — Documentación actualizada.
- `project/components/dashboard-components.md` — Documentación actualizada.

### Decisiones
- El listado general se mantiene sin botón de creación; la creación se habilita solo desde listados contextuales (Franchise, Series, Publisher).
- La navegación de edición siempre va a `/works/:id/edit`. El backend provee el contexto real, no se infiere desde el listado origen.

### Notas
- El endpoint `GET /api/admin-works` ya estaba implementado en `works.service.ts` como `getWorks`.
- La integración del listado general con `WorksListing` se completó en etapas previas de esta sesión.
