# TASK-DASH-0091 — Adaptar listado de Works de Series

## Objetivo

Adaptar el listado de obras asociado a una **Series** para trabajar con la nueva entidad unificada `Work`.

El listado debe dejar de depender del modelo/endpoints de `Number` y utilizar exclusivamente la nueva API de `Work`.

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

Revisar también la implementación actual del listado de números de Series y utilizarla como referencia funcional y visual.

Al finalizar, actualizar únicamente:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Mantener la arquitectura del Dashboard:

* La funcionalidad debe pertenecer a la feature de Series/Works correspondiente.
* La Page debe encargarse de composición y estado de alto nivel.
* Extraer toolbar, búsqueda, filtros, tabla, paginación, loading, errores y acciones a componentes cuando corresponda.
* Los componentes visuales no deben realizar llamadas HTTP.
* El acceso a la API debe estar encapsulado en un service.
* Reutilizar componentes existentes antes de crear nuevos.
* No crear abstracciones compartidas prematuramente.

## Funcionalidad

Adaptar el listado existente de números de una Series para representar `Work`.

El listado debe:

* Mantener la apariencia y comportamiento actual del listado.
* Continuar mostrando los Works asociados a la Series.
* Mantener búsqueda.
* Mantener filtros existentes que correspondan.
* Mantener ordenamiento.
* Mantener paginación.
* Mantener loading y manejo de errores.
* Mantener las acciones de edición existentes.

La información debe provenir del modelo `Work`, no de `Number`.

## API

Utilizar exclusivamente:

```text
GET /api/admin-works/series/{seriesId}
```

El endpoint ya devuelve únicamente Works cuyo contexto es esa Series:

```text
SeriesId = {seriesId}
PublisherId = null
FranchiseId = null
```

No realizar filtrado adicional en frontend para determinar el contexto.

No utilizar nuevamente endpoints de:

```text
/api/admin-numbers
```

ni endpoints específicos de `Number`.

El service debe encapsular la llamada HTTP y mapear la respuesta al modelo utilizado por el listado.

## Nuevo Work

El listado debe incorporar la acción para crear una nueva obra asociada a la Series.

El botón debe conservar el concepto utilizado actualmente para esta pantalla:

**Nuevo número**

Al seleccionarlo, navegar al formulario unificado de `Work` pasando el contexto:

```text
SeriesId = {seriesId}
```

El formulario será el responsable de crear el `Work` con esa dependencia.

No crear un formulario específico para Series.

## Edición

La edición debe utilizar el formulario unificado de `Work`.

Al editar:

* No reconstruir el contexto a partir de la URL del listado.
* No asumir que el Work pertenece a la Series únicamente porque fue abierto desde este listado.
* Obtener el Work desde backend.
* Utilizar la información devuelta por backend como fuente de verdad sobre su dependencia.
* Preservar dicha dependencia al guardar.

El mismo Work debe poder editarse posteriormente desde cualquier otro listado sin perder su contexto real.

## Reutilización

Reutilizar:

* componentes existentes del listado de Series;
* componentes de tabla;
* paginación;
* búsqueda;
* filtros;
* ordenamiento;
* acciones;
* componentes del formulario unificado de Work.

Eliminar dependencias innecesarias de componentes o servicios específicos de `Number`.

## Validación

Verificar:

1. El listado carga Works mediante `/api/admin-works/series/{id}`.
2. No realiza llamadas a endpoints antiguos de Number.
3. La búsqueda funciona correctamente.
4. Los filtros existentes continúan funcionando.
5. El ordenamiento funciona.
6. La paginación funciona.
7. El botón **Nuevo número** abre el `WorkForm` con `SeriesId`.
8. Crear un Work desde una Series conserva correctamente su dependencia.
9. Editar un Work funciona desde este listado.
10. La edición utiliza la dependencia informada por backend.
11. El listado no contiene lógica basada en `WorkType`.
12. No se perdió funcionalidad existente del listado.
13. TypeScript compila correctamente.
14. Vite compila correctamente.
15. La implementación respeta la separación Page / Feature / Components / Services.
16. No quedó código relacionado con el antiguo listado de Numbers que ya no sea necesario.

---

## Resultado de ejecución

### Estado: Finished

### Archivos nuevos
- `features/works/pages/series-works-page.tsx` — Page del listado contextual de Works de Series. Carga la Series, usa `getWorksBySeries` y renderiza `WorksListing` con contexto, botón "Nuevo Número" y back navigation.

### Archivos modificados
- `features/works/components/works-listing.tsx` — Componente compartido reutilizado por los listados general, Franchise, Series y Publisher.
- `app/router/routes.tsx` — Rutas actualizadas a `/series/:seriesId/works`, `/series/:seriesId/works/create`, `/series/:seriesId/works/:workId/edit`.
- `pages/series-page.tsx` — Acción de gestión actualizada a `/series/:seriesId/works`; tooltip a "Gestionar obras".
- `project/pages.md` — Documentación actualizada.
- `project/components/dashboard-components.md` — Documentación actualizada.

### Decisiones
- Se reutilizó el componente `WorksListing` creado en esta misma epic para evitar duplicación.
- La edición siempre navega a `/works/:id/edit`. El backend provee el contexto real.
- Se eliminaron `numbers-page.tsx`, `number-form-page.tsx` y el service/types de Number en TASK-DASH-0094.

### Notas
- `getWorksBySeries` ya estaba implementado en `works.service.ts`.
