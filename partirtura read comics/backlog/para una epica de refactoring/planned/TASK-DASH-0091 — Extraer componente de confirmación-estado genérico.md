# TASK-DASH-0091 — Extraer componente de confirmación-estado genérico

## Objetivo

Extraer el componente de modal de confirmación de estado duplicado en 3 features (Roles, Tags, List Types) a un componente genérico en `shared/`, eliminando la duplicación de código.

## Contexto

Los siguientes componentes son idénticos salvo el nombre del recurso y textos de UI:

- `features/roles/components/role-state-modal.tsx`
- `features/tags/components/tag-state-modal.tsx`
- `features/list-types/components/list-type-state-modal.tsx`

Todos manejan: confirmación para desactivar o reactivar, con iconos y mensajes contextuales (warning rojo para desactivar, info verde para reactivar).

## Leer antes de implementar

- `project/frontend-coding-rules.md` — Feature architecture, shared components.
- `features/roles/components/role-state-modal.tsx` — Referencia de implementación.
- TASK-DASH-0087 — Patrón de extracción de componentes similares.

## Implementar

1. Crear componente genérico `EntityStateModal` en `features/shared/components/`.
2. Props:
   - `mode: 'deactivate' | 'activate' | null`
   - `isOpen: boolean`
   - `entity: { id: number; name: string } | null` (tipo genérico minimal)
   - `entityName: string` (ej: "rol", "etiqueta", "tipo de lista")
   - `isSaving: boolean`
   - `onConfirm: () => void`
   - `onClose: () => void`
3. Mensajes contextuales:
   - Deactivate title: "Desactivar [EntityName]"
   - Activate title: "Reactivar [EntityName]"
   - Confirm buttons: "Confirmar Desactivación" / "Confirmar Reactivación"
4. Migrar las 3 implementaciones.
5. Actualizar `project/components.md`.

## Validación

- TypeScript compila sin errores.
- Vite build exitoso.
- Las páginas de Roles, Tags y List Types mantienen el mismo comportamiento visual y funcional.
