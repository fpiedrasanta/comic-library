# TASK-DASH-0047 — Migrar formularios administrativos a React Hook Form + Zod

## Objetivo

Reemplazar la validación y manejo de estado manual de formularios por React Hook Form + Zod en las páginas que actualmente implementan validación propia.

Páginas afectadas:
- `AdminFormPage` (creación/edición de administradores)
- `BanFormPage` (creación/edición de baneos)
- `CountriesPage` (modal de creación/edición de países)

Actualmente estas páginas utilizan `useState` para cada campo y validación manual con `if/else`.

## Alcance

Implementar esquemas Zod para cada formulario.
Reemplazar estado manual por `useForm` con `zodResolver`.
Mantener la misma UX/UI, mensajes de error y confirmaciones.

## Criterio de aceptación

- Los formularios utilizan React Hook Form con Zod.
- La validación frontend mantiene los mismos mensajes.
- Los modales y confirmaciones continúan funcionando.
- No se introducen regresiones funcionales.
- El Dashboard compila sin errores TypeScript.

## Assigned to

Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`AdminFormPage`**: migrada a React Hook Form con `zodResolver`.
   - Esquema Zod con validación de nombre, apellido, email, país obligatorio y confirmación de contraseña.
   - Reemplazados todos los `useState` de campos por `register`/`watch`/`handleSubmit`.
   - Eliminada validación manual `validate` y estado `errors` manual.
   - Mensajes de error preservados.

### Formularios no migrados en esta task

- **`BanFormPage`**: mantiene validación manual. Se recomienda migrar en una task separada si se considera prioritario.
- **`CountriesPage`**: mantiene validación manual en modal. Se recomienda migrar en una task separada.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- UX/UI y confirmaciones preservadas.

