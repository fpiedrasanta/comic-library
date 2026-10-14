# TASK-DASH-0072 — Implementar maqueta de listado de Series

## Objetivo

Implementar la pantalla de listado administrativo de Series utilizando como referencia visual y estructural el template UX/UI:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-series.html

La implementación debe respetar la estructura visual, distribución, componentes, estados y estilos definidos en el template.

## Alcance

Implementar la página de listado de Series.

La pantalla debe contemplar:

- Búsqueda.
- Filtros.
- Ordenamiento.
- Paginación.
- Visualización de Series.
- Acciones de edición.
- Acción de desactivación.
- Acción de reactivación.
- Estados visuales definidos por el template.

## Búsqueda

La búsqueda debe enviarse como un único parámetro `search`.

El Backend será responsable de buscar por:

- Nombre de Serie.
- Nombre de Franquicia.
- Nombre de Editorial.

El frontend no debe implementar búsquedas paralelas para estos campos.

## Filtros

Implementar los siguientes filtros:

- Editorial.
- Franquicia.
- Destacada.
- Vigente.
- Activa.

Los filtros deben formar parte del estado de la consulta.

## Select de Editorial

El selector de Editorial debe utilizar el mismo patrón de interacción y comportamiento utilizado por `CountrySearchSelect`.

Debe permitir:

- Buscar.
- Seleccionar.
- Mostrar la selección actual.
- Limpiar la selección cuando corresponda.
- Manejar loading.
- Manejar error.
- Manejar ausencia de resultados.

Si para obtener las Editoriales necesarias no existe actualmente un endpoint adecuado, NO inventar un endpoint ni modificar contratos.

Según `communication.md`, crear una task para Backend solicitando el endpoint/contrato necesario.

## Select de Franquicia

El selector de Franquicia debe utilizar el mismo patrón de interacción y comportamiento utilizado por `CountrySearchSelect`.

Debe permitir:

- Buscar.
- Seleccionar.
- Mostrar la selección actual.
- Limpiar la selección cuando corresponda.
- Manejar loading.
- Manejar error.
- Manejar ausencia de resultados.

Si para obtener las Franquicias necesarias no existe actualmente un endpoint adecuado, NO inventar un endpoint ni modificar contratos.

Según `communication.md`, crear una task para Backend solicitando el endpoint/contrato necesario.

## Ordenamiento

Implementar:

- Nombre.
- Franquicia.
- Editorial.
- País.

Dirección:

- ASC.
- DESC.

El mapeo de los valores visuales a los valores definidos por el contrato del Backend debe realizarse en el servicio.

## Tabla

Mostrar:

- Imagen.
- Nombre.
- Franquicia.
- Editorial.
- Color.
- Destacada.
- Vigente.
- Activa.
- Acciones.

## Acciones

### Serie activa

Mostrar:

- Editar.
- Desactivar.

### Serie inactiva

Mostrar:

- Editar.
- Reactivar.

Las operaciones de activación/desactivación deben invalidar/refrescar la consulta del listado conservando los criterios actuales.

## Navegación

Nueva Serie:

`/series/create`

Edición:

`/series/{id}/edit`

## Estados

Implementar los estados definidos por el template:

- Loading.
- Error.
- Sin resultados.
- Resultados.
- Procesando desactivación.
- Procesando activación.
- Modal de confirmación.
- Toast de éxito.

## Integración

Si los endpoints definidos por Backend ya están disponibles, consumirlos.

Si falta cualquier dato o endpoint necesario:

1. Revisar primero `endpoints.md`.
2. Revisar `communication.md`.
3. Si realmente falta información, crear una task para Backend.
4. No modificar `endpoints.md`.
5. No inventar contratos.
6. No implementar mocks como solución definitiva.

## Componentización

Reutilizar componentes existentes cuando corresponda.

Especialmente:

- Componentes de búsqueda.
- Selects.
- Paginación.
- ProtectedImage.
- Modales.
- Toasts.
- Estados de loading/error.

No duplicar lógica existente.

## Documentación

Actualizar:

- `pages.md`
- `components.md`

Registrar la nueva página y los componentes creados o reutilizados.

## Restricciones

El Dashboard Agent:

- No modifica `endpoints.md`.
- No modifica contratos de Backend.
- No modifica código Backend.
- No inventa endpoints.
- No crea servicios mock como reemplazo de una integración real cuando el contrato Backend existe o puede solicitarse.

## Criterios de aceptación

- La pantalla reproduce el template UX/UI.
- La búsqueda funciona mediante el contrato definido.
- Los filtros funcionan.
- El listado funciona con paginación.
- El ordenamiento funciona.
- Editorial y Franquicia utilizan componentes reutilizables con comportamiento equivalente a `CountrySearchSelect`.
- Las acciones de activación/desactivación funcionan.
- La navegación a alta y edición funciona.
- Cualquier dependencia faltante del Backend queda registrada mediante task.
- `tsc -b --noEmit` sin errores.
- `vite build` exitoso.

## Estado actual

**Estado**: Completada ✅

**Implementación final**:
- ✅ Creada página `pages/series-page.tsx` con listado completo de Series
- ✅ Búsqueda por nombre de serie, franquicia o editorial (parámetro `search` único)
- ✅ Filtro de Editorial: `PublisherSearchSelect` con comportamiento tipo `CountrySearchSelect`
- ✅ Filtro de Franquicia: `FranchiseSearchSelect` con comportamiento tipo `CountrySearchSelect`
- ✅ Filtros: Destacada, Vigente, Activa (implementados con selects)
- ✅ Ordenamiento: Nombre, Franquicia, Editorial, País (ASC/DESC)
- ✅ Tabla con columnas: Imagen, Nombre, Franquicia, Editorial, Color, Destacada, Vigente, Activa, Acciones
- ✅ Acciones: Editar, Desactivar (serie activa) / Reactivar (serie inactiva)
- ✅ Modal de confirmación para activación/desactivación
- ✅ Toast de éxito tras operaciones
- ✅ Paginación completa con navegación
- ✅ Integración con endpoints del Backend

**Endpoints utilizados para filtros**:
- `GET /api/admin-publishers` - Para poblar selector de Editorial (con búsqueda y filtro `isActive`)
- `GET /api/admin-franchises` - Para poblar selector de Franquicia (con búsqueda y filtro `isActive`)
- `GET /api/admin-series` - Listado paginado con todos los filtros
- `PATCH /api/admin-series/{id}/activate` - Activar serie
- `PATCH /api/admin-series/{id}/deactivate` - Desactivar serie

**Componentes creados**:
- `features/series/components/publisher-search-select.tsx`
- `features/series/components/franchise-search-select.tsx`

**Características de los selects**:
- Búsqueda con debounce (300ms)
- Navegación por teclado (flechas, Enter, Escape)
- Estados: loading, error, sin resultados
- Botón para limpiar selección
- Muestra nombre de la selección actual
- Se abre al hacer focus
- Se cierra al hacer click fuera o seleccionar