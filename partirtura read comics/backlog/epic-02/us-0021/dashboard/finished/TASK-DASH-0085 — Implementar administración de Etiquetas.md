# TASK-DASH-0085 — Implementar administración de Etiquetas

## Objetivo

Implementar la administración de Etiquetas en el Dashboard utilizando la maqueta como referencia visual y respetando la arquitectura y componentización existente.

## Referencia visual

Maqueta:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\tags.html`

La maqueta define la referencia visual de la página.

Mantener la línea estética de las demás páginas del Dashboard, especialmente Roles.

## Documentación

Leer antes de implementar:

* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar también las páginas y componentes existentes de administración, especialmente Roles y Personas.

Actualizar al finalizar:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Implementar la funcionalidad dentro de una feature propia de Tags.

No colocar todo el HTML de la maqueta dentro de `TagsPage`.

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

No duplicar componentes que ya existan para Roles, Personas u otras features.

La estructura debe respetar la organización por **features + components** utilizada por el Dashboard.

## Funcionalidad

Implementar:

* Ruta `/tags`.
* Entrada correspondiente en la navegación.
* Listado paginado de Etiquetas.
* Búsqueda por nombre.
* Filtro por `IsActive`.
* Ordenamiento por nombre.
* Crear Tag.
* Editar nombre.
* Desactivar Tag.
* Reactivar Tag.
* Estados de loading, vacío y error.
* Confirmación para desactivar/reactivar.
* Validación del formulario.

El formulario contiene únicamente:

* `Name`

## API

Utilizar los endpoints definidos por Backend para Tags.

Endpoints esperados en 

* `project/endpoints.md`

Respetar los contratos existentes y centralizar la comunicación mediante el servicio correspondiente de la feature.

No implementar lógica de negocio en los componentes visuales.

## Reutilización

Revisar especialmente:

* componentes de Roles;
* componentes de Personas;
* componentes genéricos existentes para tablas, modales, filtros, paginación, confirmaciones y formularios.

No crear una segunda implementación de un componente que ya pueda reutilizarse.

Verificar que los cambios no rompan las funcionalidades existentes.

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Navegación a `/tags`.
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

## Estado: Bloqueada

La implementación de la interfaz de usuario está completa y verificada (TypeScript + Vite build exitosos). Sin embargo, la integración funcional con el backend está bloqueada porque los endpoints requeridos aún no existen o están incompletos.

### Trabajo completado
Se implementó toda la pantalla de administración de Etiquetas siguiendo el patrón de Roles:

**Componentes creados** dentro de `features/tags/components/`:
1. **`tags-toolbar.tsx`** — Toolbar con búsqueda por nombre, filtro de estado (Todos/Activo/Inactivo) y selector de ordenamiento (Nombre A-Z / Z-A).
2. **`tags-table.tsx`** — Tabla de listado con columnas Nombre, Estado, Acciones. Maneja estados de loading (skeleton), empty y error con retry.
3. **`tags-pagination.tsx`** — Controles de paginación con botones primero/anterior/siguiente/última y input numérico.
4. **`tag-form-modal.tsx`** — Modal para crear y editar una etiqueta. Campo `Name` con validación (obligatorio, max 150 chars), banner de error del servidor, botones Cancelar/Guardar.
5. **`tag-state-modal.tsx`** — Modal de confirmación para desactivar/reactivar. Mensajes contextuales según la operación.

**Página creada** `features/tags/pages/tags-page.tsx`:
- Composición de los componentes anteriores (Page ≠ HTML monolítico).
- Estado de alto nivel: paginación, búsqueda, sort, filtro, modales, formulario, saving/loading.
- TanStack Query para el listado con clave consistente `['tags', ...]`.
- Invalidación de cache tras crear/editar/desactivar/reactivar.
- Mensajes de éxito con auto-ocultado.
- `useDashboardPageHeader` para título y botón "Nueva Etiqueta".

**Tipos creados** en `features/tags/types/tag.ts`:
- `Tag`, `TagListResponse`, `CreateTagResponse`.

**Servicio creado** en `features/tags/services/tag.service.ts`:
- `getTags`, `createTag`, `updateTag`, `deactivateTag`, `activateTag`.

**Archivos modificados:**
1. `app/router/routes.tsx` — Agregada ruta `/tags` → `TagsPage`.
2. `pages/dashboard-layout.tsx` — Agregada entrada de navegación "Etiquetas" con icono `Tags`, entre Roles y Administradores.
3. `project/pages.md` — Agregada página Tags `/tags`.
4. `project/components.md` — Agregados 6 nuevos componentes.

### Estado: Bloqueada (resuelta)

**Dependencia resuelta:** TASK-API-0212 — Implementar endpoints de administración de Etiquetas — está en `finished`.

El backend implementó los 5 endpoints y actualizó `endpoints/endpoints-tags.md` con los contratos completos. La dependencia que bloqueaba esta tarea está resuelta.

La integración con API ya estaba implementada en el servicio frontend (`tag.service.ts`), alineada con los contratos documentados. Se verificó que:

- `GET /api/admin-tags` con `isActive` → soportado en el servicio ✓
- `POST /api/admin-tags` → `createTag` implementado ✓
- `PUT /api/admin-tags/{tagId}` → `updateTag` implementado ✓
- `POST /api/admin-tags/{tagId}/deactivate` → `deactivateTag` implementado ✓
- `POST /api/admin-tags/{tagId}/activate` → `activateTag` implementado ✓

### Resultado de ejecución

### Qué se implementó

Administración completa de Etiquetas en el Dashboard, siguiendo el patrón de Roles y Persons:

**Componentes creados** dentro de `features/tags/components/`:
1. **`tags-toolbar.tsx`** — Toolbar con búsqueda por nombre, filtro de estado (Todos/Activo/Inactivo) y selector de ordenamiento (Nombre A-Z / Z-A).
2. **`tags-table.tsx`** — Tabla de listado con columnas Nombre, Estado, Acciones. Maneja estados de loading (skeleton), empty y error con retry.
3. **`tags-pagination.tsx`** — Controles de paginación con botones primero/anterior/siguiente/última y input numérico.
4. **`tag-form-modal.tsx`** — Modal para crear y editar una etiqueta. Campo `Name` con validación (obligatorio, max 150 chars), banner de error del servidor, botones Cancelar/Guardar.
5. **`tag-state-modal.tsx`** — Modal de confirmación para desactivar/reactivar. Mensajes contextuales según la operación.

**Página creada** `features/tags/pages/tags-page.tsx`:
- Composición de los componentes anteriores (Page ≠ HTML monolítico).
- Estado de alto nivel: paginación, búsqueda, sort, filtro, modales, formulario, saving/loading.
- TanStack Query para el listado con clave consistente `['tags', ...]`.
- Invalidación de cache tras crear/editar/desactivar/reactivar.
- Mensajes de éxito con auto-ocultado.
- `useDashboardPageHeader` para título y botón "Nueva Etiqueta".

**Tipos creados** en `features/tags/types/tag.ts`:
- `Tag`, `TagListResponse`, `CreateTagResponse`.

**Servicio creado** en `features/tags/services/tag.service.ts`:
- `getTags`, `createTag`, `updateTag`, `deactivateTag`, `activateTag`.

### Qué se modificó
1. `app/router/routes.tsx` — Agregada ruta `/tags` → `TagsPage`.
2. `pages/dashboard-layout.tsx` — Agregada entrada de navegación "Etiquetas" con icono `Tags` de lucide-react, entre Roles y Administradores.
3. `project/pages.md` — Agregada página Tags `/tags`.
4. `project/components.md` — Agregados 6 nuevos componentes: TagsPage, TagsToolbar, TagsTable, TagsPagination, TagFormModal, TagStateModal.

### Verificación
- **TypeScript**: `npx tsc --noEmit` — ✓ sin errores.
- **Vite build**: `npx vite build` — ✓ exitoso (1736 módulos transformados).
- **Integración API**: El servicio frontend implementa las 5 operaciones alineadas con los contratos documentados en `endpoints/endpoints-tags.md` (actualizados por TASK-API-0212): GET list con isActive, POST create, PUT update, POST deactivate, POST activate.

### Notas
- Se reutilizó el patrón de Roles (TASK-DASH-0084) como referencia visual y arquitectónica.
- `Tag.isActive` es requerido en el tipo (el GET siempre devuelve el campo según el contrato actualizado).
- La task original se creó como TASK-API-0209 en `planned/api/` como dependencia, pero fue resuelta por TASK-API-0212 (también en `finished`).
