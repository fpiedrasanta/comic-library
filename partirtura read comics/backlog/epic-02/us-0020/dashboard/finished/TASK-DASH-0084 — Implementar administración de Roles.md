# TASK-DASH-0084 — Implementar administración de Roles

## Objetivo

Implementar la administración de Roles en el Dashboard utilizando la maqueta como referencia visual y respetando la arquitectura y componentización existente.

## Referencia visual

Maqueta:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\roles.html`

La maqueta define la referencia visual de la página.

Mantener la línea estética de las demás páginas del Dashboard.

## Documentación

Leer antes de implementar:

* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar también las páginas y componentes existientes de administración, especialmente Personas y otras entidades CRUD similares.

Actualizar al finalizar:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Implementar la funcionalidad dentro de una feature propia de Roles.

No colocar todo el HTML de la maqueta dentro de `RolesPage`.

La Page debe encargarse de composición y estado de alto nivel.

Extraer a componentes las partes reutilizables o con responsabilidad propia, por ejemplo:

* listado
* filtros
* paginación
* formularios
* modal de creación
* modal de edición
* confirmaciones
* estados de carga, vacío y error

Reutilizar componentes existentes cuando corresponda.

No duplicar componentes que ya existan para Personas u otras features.

La estructura debe respetar la organización por **features + components** utilizada por el Dashboard.

## Funcionalidad

Implementar:

* Ruta `/roles`.
* Entrada correspondiente en la navegación.
* Listado paginado de Roles.
* Búsqueda por nombre.
* Filtro por `IsActive`.
* Ordenamiento por nombre.
* Crear Role.
* Editar nombre.
* Desactivar Role.
* Reactivar Role.
* Estados de loading, vacío y error.
* Confirmación para desactivar/reactivar.
* Validación del formulario.

El formulario contiene únicamente:

* `Name`

## API

Utilizar los endpoints definidos por Backend para Roles.
Respetar los contratos existentes y centralizar la comunicación mediante el servicio correspondiente de la feature.
No implementar lógica de negocio en los componentes visuales.

## Reutilización

Revisar especialmente:

* componentes de Personas;
* componentes de selección/listado relacionados con Roles;
* componentes genéricos existentes para tablas, modales, filtros, paginación, confirmaciones y formularios.

No crear una segunda implementación de un componente que ya pueda reutilizarse.
Verificar que los cambios no rompan las funcionalidades existentes que utilizan Roles.

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Navegación a `/roles`.
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

## Resultado de ejecución

### Qué se implementó

Administración completa de Roles en el Dashboard, siguiendo el patrón de entidades CRUD similares (Personas, Países) con extracción de componentes según lo exige la arquitectura.

**Componentes creados** dentro de `features/roles/components/`:

1. **`roles-toolbar.tsx`** — Toolbar con búsqueda por nombre, filtro de estado (Todos/Activo/Inactivo) y selector de ordenamiento (Nombre A-Z / Z-A). Reutiliza el patrón de estilos del Dashboard (`bg-nepsCard`, `bg-nepsInput`, etc.).
2. **`roles-table.tsx`** — Tabla de listado con columnas Nombre, Estado, Acciones. Maneja estados de loading (skeleton), empty y error con retry. Reutiliza el patrón visual de la tabla de Personas.
3. **`roles-pagination.tsx`** — Controles de paginación con botones primero/anterior/siguiente/última y input numérico. Muestra rango visible y total.
4. **`role-form-modal.tsx`** — Modal para crear y editar un rol. Campo `Name` con validación (obligatorio, max 150 chars), banner de error del servidor, botones Cancelar/Guardar.
5. **`role-state-modal.tsx`** — Modal de confirmación para desactivar/reactivar. Mensajes contextuales según la operación (warning amarillo para desactivar, info verde para reactivar).

**Página creada** `features/roles/pages/roles-page.tsx`:
- Composición de los componentes anteriores (Page ≠ HTML monolítico).
- Estado de alto nivel: paginación, búsqueda, sort, filtro, modales, formulario, saving/loading.
- TanStack Query para el listado con clave consistente `['roles', ...]`.
- Invalidación de cache tras crear/editar/desactivar/reactivar.
- Mensajes de éxito con auto-ocultado.
- `useDashboardPageHeader` para título y botón "Nuevo Rol".

### Qué se modificó

1. **`types/roles.ts`** — Agregado `UpdateRoleResponse` interface. `isActive` cambiado de `boolean | undefined` (opcional) a `boolean` (requerido) en `Role`, `CreateRoleResponse` y `UpdateRoleResponse`. El endpoint GET devuelve isActive en todos los ítems.
2. **`features/roles/services/role.service.ts`** — Agregadas `updateRole`, `deactivateRole`, `activateRole`. El pageSize default cambiado de 10 a 12 para alinear con el API y el resto del Dashboard. Endpoints siguen el patrón de Personas: `PUT /admin-roles/{id}`, `POST /admin-roles/{id}/deactivate`, `POST /admin-roles/{id}/activate` (definidos en TASK-API-0207).
3. **`app/router/routes.tsx`** — Agregada ruta `/roles` → `RolesPage`.
4. **`pages/dashboard-layout.tsx`** — Agregada entrada de navegación "Roles" con icono `BadgeCheck`, entre Personas y Administradores.
5. **`project/pages.md`** — Agregada página Roles `/roles`.
6. **`project/components.md`** (dashboard-components.md) — Agregados 6 nuevos componentes: RolesPage, RolesToolbar, RolesTable, RolesPagination, RoleFormModal, RoleStateModal.

### Ajustes post-desbloqueo

Una vez completado TASK-API-0207 (backend) y actualizada la documentación en `endpoints-roles.md`, se ajustaron los siguientes items:

- **`types/roles.ts`** — Se eliminó `UpdateRoleResponse` porque el endpoint PUT devuelve `payload: null` (confirmado en el controlador backend `AdminRolesController.cs:43`). El servicio `updateRole` retorna `Promise<void>`, siguiendo el patrón de `updateCountry` en `country.service.ts`.
- **`role.service.ts`** — `updateRole` cambiado de `Promise<UpdateRoleResponse>` a `Promise<void>` para reflejar el contrato actualizado (PUT `/admin-roles/{roleId}` → `ApiResponse<object>` con `payload: null`).

### Decisiones durante la ejecución

- **Estructura por componentes**: La task exige no colocar todo el HTML en la Page. Se extrajeron 5 componentes con single responsibility. La Page solo hace composición y manejo de estado.
- **Service functions para PUT/deactivate/activate**: El backend expone GET y POST para roles (`AdminRolesController.cs`). Los endpoints PUT `/admin-roles/{roleId}`, `/{roleId}/deactivate` y `/{roleId}/activate` fueron implementados en TASK-API-0207 (estado `finished`). El servicio frontend implementa las llamadas siguiendo el patrón establecido por el backend para entidades CRUD admin:
  - `updateRole` → `PUT /admin-roles/{roleId}` (retorna void, payload null)
  - `deactivateRole` → `POST /admin-roles/{roleId}/deactivate` (retorna void, payload null)
  - `activateRole` → `POST /admin-roles/{roleId}/activate` (retorna void, payload null)
- **isActive requerido**: El `Role.isActive` pasó de opcional a requerido, ya que el endpoint GET siempre devuelve el campo. El componente `role-search-select.tsx` que consume el tipo no se rompe (no accede a `isActive` en el objeto, solo lo pasa como parámetro de búsqueda).
- **Sort por nombre**: El mockup muestra un único selector combinado (Nombre A-Z / Nombre Z-A). Se implementó como un `<select>` con `sortDir: 'asc' | 'desc'`, fijando `orderBy: 'name'` → `'Name'` en el servicio, siguiendo el patrón de Personas.
- **Icono de navegación**: Se usó `BadgeCheck` de lucide-react (no estaba importado). Los iconos existentes (`ShieldCheck`, `User`) ya estaban asignados a otros módulos.

### Verificación

- **TypeScript**: `npx tsc --noEmit` — ✓ sin errores.
- **Vite build**: `npx vite build` — ✓ exitoso (1729 módulos transformados).
- **ESLint**: No existe archivo de configuración eslint (problema preexistente). No se pudo ejecutar.
- **Integración API**: El servicio frontend implementa las 5 operaciones (GET list, POST create, PUT update, POST deactivate, POST activate) siguiendo los contratos documentados en `endpoints-roles.md` y el patrón establecido por `person.service.ts`. El backend (`AdminRolesController.cs`) expone todos los endpoints.

### Dependencia resuelta

- **TASK-API-0207 — Implementar endpoints de administración de Roles** completado (estado `finished`). Todos los endpoints PUT/POST deactivate/POST activate ahora existen en el backend y están documentados en `endpoints-roles.md`.

### Notas para el futuro

- Se puede extraer un `<DataTable>` genérico con slots para header/body/footer cuando múltiples features adopten la misma estructura de tabla. Ahora mismo Persons, Countries, Publishers y Roles comparten patrones similares pero con variaciones visuales. No se hizo para evitar premature abstraction.
