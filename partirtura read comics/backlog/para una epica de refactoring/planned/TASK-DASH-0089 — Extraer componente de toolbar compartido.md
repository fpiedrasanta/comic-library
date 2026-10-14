# TASK-DASH-0089 — Extraer componente de toolbar compartido

## Objetivo

Extraer el componente de toolbar duplicado en 3 features (Roles, Tags, List Types) a un componente genérico en `shared/`, eliminando la duplicación de código.

## Contexto

Los siguientes componentes son idénticos salvo el placeholder de búsqueda y textos de UI:

- `features/roles/components/roles-toolbar.tsx` (64 líneas)
- `features/tags/components/tags-toolbar.tsx` (64 líneas)
- `features/list-types/components/list-types-toolbar.tsx` (64 líneas)

El toolbar contiene: búsqueda por nombre (debounced no aplicado — el debounce se hace en la Page), filtro de estado (Todos/Activo/Inactivo) y selector de ordenamiento (Nombre A-Z / Z-A).

## Leer antes de implementar

- `project/frontend-coding-rules.md` — Feature architecture, shared components.
- `features/roles/components/roles-toolbar.tsx` — Referencia de implementación.
- TASK-DASH-0087 — Patrón de extracción de componentes similares.

## Implementar

1. Crear componente genérico `DashboardEntityToolbar` en `features/shared/components/`.
2. Props:
   - `search: string`
   - `onSearchChange: (value: string) => void`
   - `isActiveFilter: boolean | undefined`
   - `onIsActiveFilterChange: (value: boolean | undefined) => void`
   - `sortDir: 'asc' | 'desc'`
   - `onSortDirChange: (value: 'asc' | 'desc') => void`
   - `searchPlaceholder?: string` (default: "Buscar por nombre...")
3. Migrar `roles-toolbar`, `tags-toolbar`, `list-types-toolbar` para usar el componente genérico.
4. Actualizar `project/components.md`.

## Consideraciones

- El toolbar es un componente presentacional (no sabe de entidades ni endpoints).
- No hay diferencias funcionales entre las 3 versions — solo textos.

## Validación

- TypeScript compila sin errores.
- Vite build exitoso.
- Las páginas de Roles, Tags y List Types mantienen el mismo comportamiento visual y funcional.
