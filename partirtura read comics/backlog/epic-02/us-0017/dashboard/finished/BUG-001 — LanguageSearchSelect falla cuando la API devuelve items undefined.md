# BUG-001 — LanguageSearchSelect falla cuando la API devuelve items undefined

**Tipo:** Bug Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**User Story:** US-0017
**Estado:** finished

## Resultado de ejecución

### What was implemented
- Corrección defensiva en `LanguageSearchSelect` para evitar crash cuando `getLanguages()` devuelve `items: undefined` o respuesta vacía.

### What was changed
- `dashboard/features/numbers/components/language-search-select.tsx`:
  - `loadLanguages`: valida que `result.items` sea un array antes de asignarlo (`Array.isArray(result.items) ? result.items : []`).
  - `handleInputChange`: protege acceso a `allItems.length` con `!allItems || allItems.length === 0`.
  - `handleFocus`: protege acceso a `allItems.length` con `!allItems || allItems.length === 0`.
  - `handleKeyDown`: protege acceso a `items.length` con `items?.length ?? 0` y `(items?.length ?? 1) - 1`.
  - Render: protege condición `items?.length === 0 || items === undefined`.

### Relevant decisions
- Se aplicaron guardias mínimas solo en el componente afectado por el bug reportado. Otros search-selects (`country-search-select`, `publisher-search-select`, `franchise-search-select`, `number-search-select`, `person-search-select`, `role-search-select`) tienen el mismo patrón pero no fueron modificados para mantener el alcance acotado al bug reportado.

### Notes
- El error 503 de Gemini reportado en el log es un problema de disponibilidad del proveedor de IA externo y no un bug de código del dashboard. El frontend captura el error en el catch y lo muestra como mensaje de servidor.

## Descripción

LanguageSearchSelect lanza `TypeError: Cannot read properties of undefined (reading 'length')` cuando la respuesta de `getLanguages()` no incluye `items` o este es `undefined`.

## Pasos para reproducir

1. Ir a la página de números o al formulario de número.
2. Abrir el selector de idiomas.
3. Si la API `/admin-languages` responde sin `items` o con `items: undefined`, el componente se rompe.

## Error observado

```
TypeError: Cannot read properties of undefined (reading 'length')
    at LanguageSearchSelect (language-search-select.tsx:249:26)
```

## Causa raíz

El componente asume que `result.items` siempre es un array y lo asigna directamente a los estados `items` y `allItems`. Si `result.items` es `undefined`, los estados quedan como `undefined` y cualquier acceso a `.length` falla.

## Archivos afectados

- `dashboard/features/numbers/components/language-search-select.tsx`

## Criterios de aceptación

- El componente no se rompe si `getLanguages()` devuelve `items: undefined` o respuesta vacía.
- El dropdown muestra "No se encontraron idiomas" cuando no hay datos.
- El resto del flujo de números y formulario sigue funcionando.

## Asignado a

Dashboard Agent.
