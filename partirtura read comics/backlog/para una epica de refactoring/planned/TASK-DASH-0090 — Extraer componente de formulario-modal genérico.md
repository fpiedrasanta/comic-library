# TASK-DASH-0090 — Extraer componente de formulario-modal genérico

## Objetivo

Extraer el componente de formulario-modal duplicado en 3 features (Roles, Tags, List Types) a un componente genérico en `shared/`, eliminando la duplicación de código.

## Contexto

Los siguientes componentes son idénticos salvo el nombre del recurso y textos de UI:

- `features/roles/components/role-form-modal.tsx`
- `features/tags/components/tag-form-modal.tsx`
- `features/list-types/components/list-type-form-modal.tsx`

Todos tienen: campo `Name` (con maxLength 150), error del servidor (banner), botones Cancelar/Guardar, estado de carga (spinner).

## Leer antes de implementar

- `project/frontend-coding-rules.md` — Feature architecture, shared components.
- `features/roles/components/role-form-modal.tsx` — Referencia de implementación.
- TASK-DASH-0087 — Patrón de extracción de componentes similares.

## Implementar

1. Crear componente genérico `EntityFormModal` en `features/shared/components/`.
2. Props:
   - `mode: 'create' | 'edit' | null`
   - `isOpen: boolean`
   - `title: string` (ej: "Nuevo Rol", "Editar Rol")
   - `name: string`
   - `error: string | null`
   - `isSaving: boolean`
   - `onNameChange: (value: string) => void`
   - `onSave: () => void`
   - `onClose: () => void`
   - `fieldName?: string` (default: "Name")
   - `fieldPlaceholder?: string` (default: "Ej. Frontend")
   - `saveButtonText?: string` (default: "Guardar")
   - `editSaveButtonText?: string` (default: "Guardar Cambios")
3. Migrar las 3 implementaciones a usar el componente genérico.
4. Actualizar `project/components.md`.

## Consideraciones

- El modal recibe props para textos personalizables, manteniendo total reutilización.
- `MAX_NAME_LENGTH = 150` como constante en el componente.

## Validación

- TypeScript compila sin errores.
- Vite build exitoso.
- Las páginas de Roles, Tags y List Types mantienen el mismo comportamiento visual y funcional.
