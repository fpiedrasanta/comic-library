# TASK-DASH-0075 — Implementar listado administrativo de Series

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Referencia UX/UI:** TASK-UX-0185

## Objetivo

Implementar la pantalla administrativa de Números pertenecientes a una Serie y conectarla con `GET /api/admin-numbers`.

La maqueta UX/UI es una referencia visual y de organización. **No debe limitar las capacidades funcionales expuestas por Backend.**

## Contexto

La pantalla debe mostrar claramente:

**Editorial → Franquicia → Serie → Números**

El administrador debe poder consultar y administrar los Números de la Serie.

## Endpoint principal

```http
GET /api/admin-numbers
```

El endpoint es siempre paginado.

## Búsqueda

Implementar búsqueda por:

* Número.
* Título.

## Filtros obligatorios

La interfaz debe permitir filtrar por:

### Estado activo

* Todos.
* Activos.
* Inactivos.

### Idioma

Selector de idioma.

### Estado del contenido digital

Mostrar como mínimo:

* Todos.
* Faltante.
* Procesando.
* OK.
* Error.

El estado de contenido digital debe visualizarse independientemente del estado activo/inactivo del Número.

### Fecha de publicación

Permitir:

* Fecha desde.
* Fecha hasta.

## Ordenamiento

La interfaz debe permitir ordenar por:

* Número.
* Título.
* Fecha de publicación.
* Fecha de subida.
* Idioma.

También debe permitir seleccionar:

* ASC.
* DESC.

Cuando se ordene por Número, el Backend será responsable de aplicar el orden natural definido para los valores de catálogo.

El frontend no debe intentar reproducir esa lógica.

## Tabla

Mostrar como mínimo:

* Portada.
* Número.
* Título.
* Idioma.
* Fecha de publicación.
* Fecha de subida.
* Estado del contenido.
* Estado activo/inactivo.
* Acciones.

## Acciones

Implementar:

* Editar Número.
* Activar.
* Desactivar.
* Reintentar procesamiento cuando corresponda al estado `Error`.

## Estados

Implementar:

* Loading.
* Resultados.
* Sin resultados.
* Error.
* Procesamiento.

El estado de Processing debe ser fácilmente identificable.

## Paginación

La pantalla debe utilizar la paginación proporcionada por Backend.

Mostrar información equivalente a:

`Mostrando X-Y de Z números`

y controles de navegación.

## Importante: diferencia entre maqueta y contrato Backend

La maqueta inicial de UX/UI no contiene todos los filtros y opciones de ordenamiento soportados por Backend.

**Esto no debe considerarse una restricción.**

El Dashboard Agent debe adaptar la pantalla para incorporar:

* Filtro de activo.
* Filtro de idioma.
* Filtro de ContentStatus.
* Fecha desde.
* Fecha hasta.
* Ordenar por.
* Dirección.

La incorporación debe mantener el lenguaje visual establecido para el Dashboard.

## Criterios de aceptación

* `GET /api/admin-numbers` es consumido correctamente.
* La consulta siempre se realiza de forma paginada.
* Búsqueda por Número y Título funcional.
* Todos los filtros definidos por Backend están disponibles.
* Todos los criterios de ordenamiento definidos por Backend están disponibles.
* ASC/DESC funcional.
* ContentStatus se diferencia de IsActive.
* Las fechas se envían en el formato esperado por la API.
* La paginación funciona correctamente.
* Loading/Empty/Error están implementados.
* Las acciones de administración funcionan.
* Processing y Error tienen feedback visual adecuado.
* La UI mantiene coherencia con Series.
* La implementación no agrega lógica de negocio al frontend.

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Referencia UX/UI:** TASK-UX-0184
**Estado:** finished

## Resultado de ejecución

### Implementado

- Listado paginado contra `GET /api/admin-series` (TanStack Query).
- Búsqueda por nombre/franquicia/editorial con reset a página 1.
- Filtros: editorial, franquicia, destacada, vigente, activa.
- Orden por nombre/franquicia/editorial/país con dirección ASC/DESC.
- Acciones de administración: editar, desactivar, reactivar (con modal de confirmación).
- Botón superior "Nueva Serie" navega a `/series/select-franchise`.
- Botón superior "Todos los Números" navega a `/numbers`.
- Acción por fila "Gestionar números" navega a `/series/{id}/numbers` (per US-0017 §18).
- Estados: Loading, Empty, Error.
- Feedback de éxito y de error para activar/desactivar.

### Archivos modificados

| Archivo | Descripción |
|---------|-------------|
| `dashboard/pages/series-page.tsx` | Agregada acción per-row "Gestionar números" y renombrado botón superior para evitar ambigüedad |

### Decisiones

- El botón superior "Gestionar Números" se renombró a "Todos los Números" porque navega al listado global; el acceso per-Serie correcto está en la fila de cada Serie (US-0017 §18 explícita).
- Se reutiliza el patrón de paginación y modal de confirmación establecido por el Dashboard.