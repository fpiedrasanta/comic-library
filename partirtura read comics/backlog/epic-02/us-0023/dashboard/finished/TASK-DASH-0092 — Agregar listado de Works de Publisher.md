# TASK-DASH-0092 — Agregar listado de Works de Publisher

## Objetivo

Agregar en el Dashboard el listado de `Work` asociado a un `Publisher`.

Debe seguir el mismo concepto visual y funcional de los listados de Works de `Franchise` y `Series`.

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

Revisar las implementaciones actuales de los listados de `Franchise` y `Series` para reutilizar su estructura y comportamiento.

Al finalizar, actualizar únicamente:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Implementar el listado respetando la arquitectura actual del Dashboard:

* La Page debe encargarse de composición y estado de alto nivel.
* Separar toolbar, búsqueda, filtros, tabla, paginación, loading, errores y acciones en componentes cuando corresponda.
* Las llamadas HTTP deben estar encapsuladas en un service.
* Los componentes visuales no deben realizar llamadas HTTP.
* Reutilizar componentes existentes.
* No crear abstracciones compartidas prematuramente.

La funcionalidad debe integrarse en la feature correspondiente de Publisher/Works.

## Acceso al listado

Agregar en el listado de Publishers una acción visual equivalente al botón/logo `#` utilizado actualmente en Franchise y Series.

Al seleccionarlo, debe navegar al listado de Works asociados al Publisher.

La navegación debe conservar el `PublisherId` correspondiente.

## API

El listado debe obtener los datos exclusivamente mediante:

```text
GET /api/admin-works/publisher/{publisherId}
```

El endpoint devuelve únicamente Works cuyo contexto es ese Publisher:

```text
PublisherId = {publisherId}
FranchiseId = null
SeriesId = null
```

No realizar filtros adicionales en frontend para determinar el contexto.

No utilizar endpoints antiguos de `Number` ni de `GraphicNovel`.

El service debe encapsular la comunicación con la API y adaptar la respuesta al modelo utilizado por la pantalla.

## Listado

El listado debe representar `Work`, no `Number`.

Mantener el comportamiento visual y funcional utilizado por los listados existentes:

* búsqueda;
* filtros existentes;
* ordenamiento;
* paginación;
* loading;
* manejo de errores;
* edición;
* acciones de listado.

La pantalla debe integrarse visualmente con los listados de Franchise y Series.

## Nuevo Work

Agregar la acción para crear una nueva obra asociada al Publisher.

El botón debe utilizar el concepto:

**Nueva obra**

Al seleccionarlo, navegar al formulario unificado de `Work` pasando:

```text
PublisherId = {publisherId}
```

No crear un formulario específico para Publisher.

El `WorkForm` será responsable de utilizar ese contexto durante la creación.

## Edición

La edición debe utilizar el formulario unificado de `Work`.

Al editar:

* Obtener el Work desde backend.
* No inferir su dependencia únicamente desde el listado desde el cual se abrió.
* Utilizar la dependencia informada por backend como fuente de verdad.
* Preservar esa dependencia durante la edición.

El mismo Work debe poder editarse desde cualquier listado contextual.

## WorkType

No agregar lógica basada en el nombre o valor de `WorkType`.

El listado solamente debe mostrar la información correspondiente al Work.

La existencia de un `WorkType` determinado no debe modificar el comportamiento del listado.

## Reutilización

Reutilizar, cuando corresponda:

* componentes del listado de Franchise;
* componentes del listado de Series;
* tabla;
* búsqueda;
* filtros;
* paginación;
* acciones;
* navegación;
* componentes del formulario unificado de Work.

Evitar duplicar componentes que ya puedan reutilizarse.

## Validación

Verificar:

1. El listado de Publishers muestra una acción para acceder a sus Works.
2. La navegación conserva correctamente el `PublisherId`.
3. El listado utiliza `/api/admin-works/publisher/{id}`.
4. No utiliza endpoints antiguos de Number.
5. Los Works mostrados pertenecen al Publisher seleccionado.
6. Búsqueda, filtros, ordenamiento y paginación funcionan correctamente.
7. El botón **Nueva obra** abre el `WorkForm` con `PublisherId`.
8. Crear un Work desde Publisher conserva correctamente su dependencia.
9. Editar un Work funciona desde este listado.
10. La edición utiliza la dependencia informada por backend.
11. No existe lógica frontend basada en `WorkType`.
12. TypeScript compila correctamente.
13. Vite compila correctamente.
14. La implementación respeta Page / Components / Services.
15. La pantalla mantiene consistencia visual con Franchise y Series.

---

## Resultado de ejecución

### Estado: Finished

### Archivos nuevos
- `features/works/pages/publisher-works-page.tsx` — Page del listado contextual de Works de Publisher. Carga el Publisher, usa `getWorksByPublisher` y renderiza `WorksListing` con contexto, botón "Nueva Obra" y back navigation.

### Archivos modificados
- `features/works/components/works-listing.tsx` — Componente compartido reutilizado por los listados general, Franchise, Series y Publisher.
- `app/router/routes.tsx` — Rutas nuevas agregadas: `/publishers/:publisherId/works`, `/publishers/:publisherId/works/create`, `/publishers/:publisherId/works/:workId/edit`.
- `pages/publishers-page.tsx` — Agregada acción "Gestionar obras" en la tabla de Publishers con navegación a `/publishers/:publisherId/works`.
- `project/pages.md` — Documentación actualizada.
- `project/components/dashboard-components.md` — Documentación actualizada.

### Decisiones
- Se reutilizó el componente `WorksListing` creado en esta misma epic para evitar duplicación.
- La edición siempre navega a `/works/:id/edit`. El backend provee el contexto real.
- No se requirió modificar el service de Publishers; `getPublisher` ya estaba disponible.

### Notas
- `getWorksByPublisher` ya estaba implementado en `works.service.ts`.
