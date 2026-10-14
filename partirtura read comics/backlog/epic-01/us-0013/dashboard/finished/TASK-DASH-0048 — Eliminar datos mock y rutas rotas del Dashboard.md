# TASK-DASH-0048 — Eliminar datos mock y rutas rotas del Dashboard

## Objetivo

Remover datos hardcodeados y rutas no funcionales del Dashboard.

## Hallazgos

### 1. HomePage con datos mock

`pages/home-page.tsx` contiene KPIs y tabla de catálogo con datos hardcodeados:
- Números fijos de cómics, usuarios, lecturas.
- Tabla con filas estáticas de ejemplo.
- Filtro de editorial sin funcionalidad.

Según `dashboard-architecture.md`, el Dashboard debe consultar estadísticas mediante la API.

### 2. Rota rota en sidebar

`dashboard-layout.tsx` incluye un `NavLink` hacia `/catalog` que no está definido en `routes.tsx`.

### 3. Botón de menú mobile sin funcionalidad

En `dashboard-layout.tsx`, el botón `Menu` del header mobile no tiene `onClick` ni abre ningún panel de navegación.

## Alcance

- Reemplazar datos mock por queries reales o estados vacíos placeholder.
- Corregir o eliminar la ruta `/catalog` del sidebar.
- Implementar o deshabilitar el menú mobile.

## Criterio de aceptación

- No existen datos hardcodeados en páginas del Dashboard.
- Todas las rutas del sidebar son válidas.
- El menú mobile tiene comportamiento definido (abrir/cerrar o eliminado).
- El Dashboard compila correctamente.

## Assigned to

Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`pages/home-page.tsx`**: eliminados todos los datos mock.
   - KPIs reemplazados por placeholders con `—` y texto "Estadística pendiente de API."
   - Tabla de catálogo eliminada; reemplazada por mensaje "Catálogo no disponible" con explicación de próxima etapa.
2. **`pages/dashboard-layout.tsx`**: eliminado `NavLink` a `/catalog` del sidebar. Eliminado header mobile con botón `Menu` sin funcionalidad.
3. Imports de `BookOpen`, `LayoutDashboard` y `Menu` removidos de `dashboard-layout.tsx`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- No quedan rutas rotas ni datos hardcodeados en el Dashboard.

