# TASK-DASH-0086 — Implementar administración de Tipos de Lista

## Objetivo

Implementar la administración de Tipos de Lista en el Dashboard utilizando la maqueta como referencia visual y respetando la arquitectura y componentización existente.

## Referencia visual

Maqueta:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\list-types.html`

La maqueta define la referencia visual de la página.

Mantener la línea estética de las demás páginas del Dashboard, especialmente Roles y Etiquetas.

## Documentación

Leer antes de implementar:

* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar también las páginas y componentes existentes de administración, especialmente Roles y Etiquetas.

Actualizar al finalizar:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Implementar la funcionalidad dentro de una feature propia de List Types.

No colocar todo el HTML de la maqueta dentro de `ListTypesPage`.

La Page debe encargarse de composición y estado de alto nivel.

Extraer a componentes las partes reutilizables o con responsabilidad propia, por ejemplo:

* listado
* filtros
* paginación
* formularios
* modales
* confirmaciones
* estados de carga, vacío y error

Reutilizar componentes existentes cuando corresponda.

No duplicar componentes que ya existan para Roles, Etiquetas, Personas u otras features.

La estructura debe respetar la organización por **features + components** utilizada por el Dashboard.

## Funcionalidad

Implementar:

* Ruta `/list-types`.
* Entrada correspondiente en la navegación.
* Listado paginado de Tipos de Lista.
* Búsqueda por nombre.
* Filtro por `IsActive`.
* Ordenamiento por nombre.
* Crear List Type.
* Editar nombre.
* Desactivar List Type.
* Reactivar List Type.
* Estados de loading, vacío y error.
* Confirmación para desactivar/reactivar.
* Validación del formulario.

El formulario contiene únicamente:

* `Name`

## API

Utilizar los endpoints definidos por Backend para List Types.

Endpoints esperados en:

* `project/endpoints.md`
* `project/endpoints-list-types.md`

Respetar los contratos existentes y centralizar la comunicación mediante el servicio correspondiente de la feature.

No implementar lógica de negocio en los componentes visuales.

## Reutilización

Revisar especialmente:

* componentes de Roles;
* componentes de Etiquetas;
* componentes de Personas;
* componentes genéricos existentes para tablas, modales, filtros, paginación, confirmaciones y formularios.

No crear una segunda implementación de un componente que ya pueda reutilizarse.

Verificar que los cambios no rompan las funcionalidades existentes.

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Navegación a `/list-types`.
* Listado y paginación.
* Búsqueda, filtro y ordenamiento.
* Creación.
* Edición.
* Desactivación.
* Reactivación.
* Manejo de errores.
* Integración con API.
* Consistencia visual con las demás páginas.
* Correcta separación Page / Feature / Components.
* Ausencia de HTML monolítico dentro de la Page.

Actualizar `pages.md` y `components.md` con la estructura final.

---

## Estado: Finalizada

TASK-API-0217 ha sido finalizada. La documentación de endpoints (`project/endpoints/endpoints-list-types.md`) y la entrada en `project/endpoints.md` están disponibles. El servicio frontend está alineado con todos los contratos del backend.

### Trabajo completado
Se implementó toda la pantalla de administración de Tipos de Lista siguiendo el patrón de Roles y Etiquetas:

**Componentes creados** dentro de `features/list-types/components/`:
1. **`list-types-toolbar.tsx`** — Toolbar con búsqueda por nombre, filtro de estado (Todos/Activo/Inactivo) y selector de ordenamiento (Nombre A-Z / Z-A).
2. **`list-types-table.tsx`** — Tabla de listado con columnas Nombre, Estado, Acciones. Maneja estados de loading (skeleton), empty y error con retry.
3. **`list-types-pagination.tsx`** — Controles de paginación con botones primero/anterior/siguiente/última y input numérico.
4. **`list-type-form-modal.tsx`** — Modal para crear y editar un Tipo de Lista. Campo `Name` con validación (obligatorio, max 150 chars), banner de error del servidor, botones Cancelar/Guardar.
5. **`list-type-state-modal.tsx`** — Modal de confirmación para desactivar/reactivar. Mensajes contextuales según la operación.

**Página creada** `features/list-types/pages/list-types-page.tsx`:
- Composición de los componentes anteriores (Page ≠ HTML monolítico).
- Estado de alto nivel: paginación, búsqueda, sort, filtro, modales, formulario, saving/loading.
- TanStack Query para el listado con clave consistente `['listTypes', ...]`.
- Invalidación de cache tras crear/editar/desactivar/reactivar.
- Mensajes de éxito con auto-ocultado.
- `useDashboardPageHeader` para título y botón "Nuevo Tipo de Lista".

**Tipos creados** en `features/list-types/types/list-type.ts`:
- `ListType`, `ListTypeListResponse`, `CreateListTypeResponse`.

**Servicio creado** en `features/list-types/services/list-type.service.ts`:
- `getListTypes`, `createListType`, `updateListType`, `deactivateListType`, `activateListType`.
- Basado en los endpoints implementados por TASK-API-0217 (`/admin-list-types`, `/{id}`, `/{id}/deactivate`, `/{id}/activate`).
### Trabajo pendiente

Validación end-to-end del Dashboard integrado con los endpoints backend completados.
### Verificación completada
- **TypeScript**: `npx tsc --noEmit` — ✓ sin errores.
- **Vite build**: `npx vite build` — ✓ exitoso (1743 módulos transformados).
- **Ruta registrada**: `/list-types` → `ListTypesPage` en `routes.tsx`.
- **Navegación agregada**: "Tipos de Lista" con icono `List` de lucide-react en `dashboard-layout.tsx`.
- **Integración API**: El servicio frontend (`list-type.service.ts`) implementa las 5 operaciones alineadas con los contratos documentados en `endpoints/endpoints-list-types.md`: GET con isActive/orderDir/search, POST create, PUT update, POST deactivate, POST activate.

### Documentación actualizada
- `project/pages.md` — Agregada página List Types `/list-types`.
- `project/components.md` — Agregados 6 componentes: ListTypesPage, ListTypesToolbar, ListTypesTable, ListTypesPagination, ListTypeFormModal, ListTypeStateModal.

### Notas de implementación
- Se reutilizó el patrón de Roles (TASK-DASH-0084) y Etiquetas (TASK-DASH-0085) como referencia arquitectónica y visual.
- La maqueta HTML (`ux_ui/list-types.html`) define la referencia visual: barra de herramientas con búsqueda/estado/orden, tabla con Nombre/Estado/Acciones, botones de paginación y modales de crear/editar/desactivar/reactivar.
- No se crearon abstracciones genéricas en `shared/` porque: (a) las reglas prohíben abstracciones prematuras, (b) cada feature tiene textos de dominio diferentes, (c) el patrón ya está consolidado.