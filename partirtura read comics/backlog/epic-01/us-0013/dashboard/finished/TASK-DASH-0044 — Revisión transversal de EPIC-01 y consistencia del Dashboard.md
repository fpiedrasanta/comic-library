# TASK-DASH-0044 — Revisión transversal de EPIC-01 y consistencia del Dashboard

## Objetivo

Realizar una revisión transversal de las funcionalidades del Dashboard implementadas durante EPIC-01 para verificar su consistencia con la arquitectura, coding rules, contratos del Backend, UX/UI y documentación del proyecto.

La tarea es principalmente de auditoría y no debe utilizarse para introducir refactors de alcance abierto.

## Alcance

Revisar las funcionalidades relacionadas con:

- Autenticación administrativa.
- Usuarios.
- Usuarios administradores.
- Países.
- Baneos.
- Formularios.
- Listados.
- Filtros.
- Ordenamiento.
- Paginación.
- Estados activos/inactivos.
- Manejo de errores.
- Fechas.

## Validaciones

### Arquitectura

Verificar:

- Cumplimiento de la arquitectura definida para Dashboard.
- Separación entre páginas, servicios, tipos y componentes.
- Uso correcto de los servicios para comunicación con API.
- Ausencia de lógica de negocio perteneciente al Backend.
- Reutilización apropiada de componentes existentes.
- Ausencia de duplicación innecesaria.

### Coding Rules

Verificar cumplimiento de:

- Coding rules del Frontend Dashboard.
- Convenciones de nombres.
- Organización de archivos.
- Responsabilidad de componentes.
- Manejo de estados.
- Manejo de errores.
- Tipado.
- Ausencia de código muerto.
- Ausencia de mocks o datos hardcodeados que ya no correspondan.

### Integración con API

Verificar:

- Contratos utilizados.
- Requests.
- Responses.
- `ApiResponse`.
- `ListRequest`.
- `ListResponse`.
- Rutas.
- Métodos HTTP.
- Manejo de errores del Backend.
- Autorización.
- Consistencia entre tipos TypeScript y contratos reales de API.

Revisar especialmente las funcionalidades de:

- Usuarios.
- Administradores.
- Países.
- Baneos.

### Estados y semántica

Verificar que el Dashboard no derive por cuenta propia estados que son responsabilidad del Backend.

Particularmente:

- `User.IsActive`.
- `Ban.IsActive`.
- `IsBanned`.
- `BanCount`.
- Estado derivado de los baneos.
- Estado activo/inactivo de países.
- Estado activo/inactivo de administradores.

Verificar que no existan interpretaciones incorrectas entre estados administrativos y estados derivados.

### Fechas

Verificar:

- Conversión UTC/local.
- Formularios `datetime-local`.
- Visualización de fechas.
- Filtros.
- Creación y edición de baneos.
- Ausencia de offsets hardcodeados.
- Uso de las utilidades compartidas existentes.

### UX/UI

Verificar consistencia entre implementación y diseño definido:

- Listados.
- Formularios.
- Modales.
- Confirmaciones.
- Toasts.
- Estados de carga.
- Estados vacíos.
- Estados de error.
- Responsive.
- Navegación.

### Documentación

Verificar consistencia con:

- Arquitectura del Dashboard.
- `pages.md`.
- `components.md`.
- Coding rules.
- Documentación relacionada con endpoints y contratos.

Identificar documentación que haya quedado desactualizada durante EPIC-01.

### Dependencias

Revisar:

- Dependencias utilizadas durante EPIC-01.
- Dependencias innecesarias.
- Código asociado a librerías que ya no se utilizan.
- Consistencia con el stack tecnológico definido.

## Criterio de ejecución

La revisión debe considerar el estado actual del Dashboard.

Si se encuentra un problema menor y claramente aislado, puede corregirse dentro de esta task.

Si se identifica un problema que implique:

- refactoring significativo;
- cambio arquitectónico;
- modificación de contratos;
- cambio funcional;
- modificación importante de UX/UI;
- modificación de seguridad;

debe generarse una nueva task específica.

## Validación final

- El Dashboard debe compilar correctamente.
- No deben quedar mocks relacionados con funcionalidades ya integradas.
- No deben existir errores de TypeScript.
- No deben introducirse regresiones funcionales.
- Las funcionalidades de EPIC-01 deben consumir los endpoints reales.
- La documentación debe reflejar la implementación actual.

## Resultado esperado

EPIC-01 debe quedar técnicamente consolidada desde el punto de vista del Dashboard, con código, arquitectura, integración, UX/UI y documentación consistentes.

## Resultado de la auditoría

### Correcciones menores aplicadas en esta task

1. **pages.md**: Actualizada descripción de `AdminsPage`, `AdminFormPage` create y edit para reflejar que consumen backend real, eliminando referencia a "Datos mock".
2. **BansPage**: Corregido `title` del botón de revocar baneo de "Eliminar baneo" a "Revocar baneo".
3. **UsersPage**: Corregido placeholder de búsqueda de "Buscar por nombre, email, país..." a "Buscar por nombre o email..." porque el endpoint solo busca por nombre y email.
4. **auth-interceptor.ts**: Eliminada función `authFetch` sin uso (código muerto).
5. **AdminFormPage**: Eliminado fallback `COUNTRY_ID_MAP[country] || 1` para evitar envío de `countryId` inválido cuando el país no está en el mapa.

### Tareas derivadas generadas

| Task | Título | Motivo |
|------|--------|--------|
| TASK-DASH-0045 | Separar operaciones de usuarios y baneos del servicio de autenticación | `auth.service.ts` mezcla features |
| TASK-DASH-0046 | Migrar páginas de listado a TanStack Query | Server state manejado con useState local |
| TASK-DASH-0047 | Migrar formularios administrativos a React Hook Form + Zod | Validación manual en formularios |
| TASK-DASH-0048 | Eliminar datos mock y rutas rotas del Dashboard | HomePage con datos hardcodeados, ruta `/catalog` rota, menú mobile sin funcionalidad |
| TASK-DASH-0049 | Corregir manejo de fechas en formulario de baneos | `toUtcDate` descarta la hora seleccionada |
| TASK-DASH-0050 | Obtener datos de edición vía API en lugar de location.state | AdminFormPage y BanFormPage dependen de `location.state` |

### Hallazgos principales por categoría

#### Arquitectura
- **Violación de separación por features**: `auth.service.ts` contiene operaciones de usuarios y baneos. → TASK-DASH-0045
- **Server state en useState**: 5 páginas de listado usan estado local manual en lugar de TanStack Query. → TASK-DASH-0046
- **Datos mock persistentes**: `HomePage` mantiene KPIs y tabla con datos hardcodeados. → TASK-DASH-0048
- **Ruta rota**: Sidebar incluye link a `/catalog` sin ruta definida. → TASK-DASH-0048
- **Navegación mobile**: Botón de menú sin handler. → TASK-DASH-0048

#### Coding Rules
- **Componentes sobre-dimensionados**: `SettingsPage` (591 líneas), `AdminFormPage` (447 líneas), `CountriesPage` (601 líneas). Se evaluará división en TASK-DASH-0047.
- **Código muerto**: `authFetch` sin uso. → Corregido.
- **Validación manual**: 3 formularios usan validación propia en lugar de Zod. → TASK-DASH-0047

#### API
- **Contratos**: Tipos de respuesta (`ApiResponse`, `ListResponse`) consistentes con `endpoints.md`.
- **Métodos HTTP**: Correctos (GET, POST, PUT, PATCH).
- **Autorización**: `ProtectedRoute` valida rol `Administrator`.
- **Fechas**: Utilidades compartidas usadas correctamente en visualización y filtros. `toUtcDate` tiene bug de pérdida de hora en creación/edición de baneos. → TASK-DASH-0049
- **location.state**: `AdminFormPage` y `BanFormPage` obtienen datos por estado de router en lugar de API. → TASK-DASH-0050

#### Estados y semántica
- **IsActive, IsBanned, BanCount**: Derivados correctamente desde backend. No se detectó lógica de negocio duplicada en frontend.
- **Estados de baneo**: `Ban.status` es usado para presentación; es consistente con el backend.

#### Fechas
- **Conversión UTC/local**: Correcta en visualización (`formatDate`).
- **Filtros**: Correcta conversión a UTC para filtros de baneo.
- **Formularios**: `datetime-local` usado en `BanFormPage`. `toUtcDate` pierde la hora. → TASK-DASH-0049

#### UX/UI
- **Listados**: Todos tienen búsqueda, filtros, ordenamiento y paginación.
- **Formularios**: Validación visual, loading, error y success states presentes.
- **Modales y confirmaciones**: Implementadas para operaciones destructivas.
- **Responsive**: Uso de clases Tailwind responsivas.
- **Navegación**: Sidebar funcional en desktop.

#### Documentación
- **pages.md**: Actualizada en esta task.
- **components.md**: Consistente con implementación.
- **endpoints.md**: Contratos coinciden con consumo del frontend.

#### Dependencias
- **Stack**: Dependencias en `package.json` coinciden con `frontend-dashboard-stack-technology.md`.
- No se detectaron dependencias innecesarias.
- No se detectó código asociado a librerías no utilizadas (además de `authFetch` ya eliminado).

## Assigned to

Dashboard Agent

## Resultado de la ejecución

Auditoría completada. Se corrigieron 5 problemas menores aislados. Se generaron 6 tasks para problemas que requieren refactoring o cambio funcional significativo. La documentación de páginas fue actualizada.
