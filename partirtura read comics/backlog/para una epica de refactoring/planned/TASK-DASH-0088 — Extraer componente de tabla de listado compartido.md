# TASK-DASH-0088 — Extraer componente de tabla de listado compartido

## Objetivo

Extraer el componente de tabla de listado duplicado en 3 features (Roles, Tags, List Types) a un componente genérico en `shared/`, eliminando la duplicación de código.

## Contexto

Los siguientes componentes son idénticos salvo el nombre del recurso y textos de UI:

- `features/roles/components/roles-table.tsx` (131 líneas)
- `features/tags/components/tags-table.tsx` (131 líneas)
- `features/list-types/components/list-types-table.tsx` (131 líneas)

Los componentes manejan: loading skeleton, error con retry, empty state, y renderizado de filas con Estado/Acciones (desactivar/reactivar).

## Leer antes de implementar

- `project/frontend-coding-rules.md` — Feature architecture, shared components.
- `features/roles/components/roles-table.tsx` — Referencia de implementación.
- TASK-DASH-0087 — Patrón de extracción de componentes similares.

## Implementar

1. Crear componente genérico `DashboardEntityTable` en `features/shared/components/`.
2. Props necesarias:
   - `columns: ColumnDef<T>[]` (usando TanStack Table o props simples)
   - `isLoading: boolean`
   - `error: Error | null`
   - `onRetry: () => void`
   - `items: T[]`
   - `emptyTitle: string`
   - `emptyDescription: string`
   - `resourceName: string` (para keys de lista)
   - `renderActions: (item: T) => ReactNode` (botones de editar/desactivar/reactivar)
   - `getItemName: (item: T) => string` (para estados vacíos)
   - `isItemActive: (item: T) => boolean`
3. Migrar `roles-table`, `tags-table`, `list-types-table` para usar el componente genérico.
4. Actualizar `project/components.md`.

## Consideraciones

- La tabla tiene 3 columnas fijas: Nombre, Estado, Acciones.
- El patrón de Estado usa badges con colores (verde para activo, gris para inactivo).
- Las Acciones varían: active items show "Desactivar", inactive items show "Reactivar", siempre hay "Editar".
- Considerar si usar TanStack Table o props simples. Dado que estas tablas son simples (3 columnas fijas), props simples son suficientes y más ligeros.

## Validación

- TypeScript compila sin errores.
- Vite build exitoso.
- Las páginas de Roles, Tags y List Types mantienen el mismo comportamiento visual y funcional.
