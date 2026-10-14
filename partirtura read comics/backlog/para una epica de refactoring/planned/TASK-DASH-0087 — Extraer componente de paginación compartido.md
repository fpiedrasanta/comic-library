# TASK-DASH-0087 — Extraer componente de paginación compartido

## Objetivo

Extraer el componente de paginación duplicado en 3 features (Roles, Tags, List Types) a un componente genérico en `shared/`, eliminando la duplicación de código.

## Contexto

Los siguientes componentes son idénticos salvo el nombre del recurso y textos de UI:

- `features/roles/components/roles-pagination.tsx` (99 líneas)
- `features/tags/components/tags-pagination.tsx` (99 líneas)
- `features/list-types/components/list-types-pagination.tsx` (99 líneas)

## Leer antes de implementar

- `project/frontend-coding-rules.md` — Feature architecture: "Organize by feature folders. Within features: `components/`, `hooks/`, `api/`, `types/`, `utils/`. Public Web and Dashboard are independent. Shared code via explicit shared library."
- `project/dashboard-architecture.md` — Shared components only for truly transversal elements.
- `features/roles/components/roles-pagination.tsx` — Referencia de implementación.

## Implementar

1. Crear `features/shared/components/pagination/` (o `components/ui/dashboard-pagination.tsx` si existe convención).
2. El componente genérico `DashboardPagination` debe aceptar:
   - `currentPage: number`
   - `totalPages: number`
   - `totalCount: number`
   - `pageSize: number`
   - `isLoading: boolean`
   - `resourceLabel: string` (ej: "roles", "etiquetas", "tipos de lista")
   - `onPageChange: (page: number) => void`
3. Migrar `roles-pagination.tsx`, `tags-pagination.tsx`, `list-types-pagination.tsx` para usar el componente genérico.
4. Actualizar `project/components.md` con el nuevo componente.

## Restricciones

- No cambiar el comportimiento visual.
- Mantener el mismo estilo Tailwind.
- `resourceLabel` controla el texto "Mostrando X de Y [resourceLabel]".

## Consideraciones de diseño de componentes

**Composition sobre props para buttons:**

Cuando las páginas que usan este componente genérico tengan botones, deben seguir el patrón:

1. **`components/ui/button.tsx`** — Botón base con variants del shadcn/ui (primario, secundario, peligro).
2. **`features/shared/components/buttons/dashboard-button.tsx`** — Botón con estilo del Dashboard (nepsPrimary, nepsInput, etc.). Extiende/vuelve a envolver el base button.
3. **`features/roles/components/...`** — Botón específico de la feature (ej: `role-save-button`) que recibe el DashboardButton con props de texto/acción.

Esto permite: cambiar el estilo base en `dashboard-button` afecta todas las features; cambiar colores del shadcn/ui en `button` afecta todo el app.

La paginación por sí misma solo necesita props (no composition), ya que es completamente configuracional.
