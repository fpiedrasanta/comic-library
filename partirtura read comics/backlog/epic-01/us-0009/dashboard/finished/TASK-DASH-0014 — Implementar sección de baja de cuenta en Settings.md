# TASK-DASH-0014 — Implementar sección de baja de cuenta en Settings

## Objetivo

Implementar en `SettingsPage` del Dashboard la sección que permite al usuario autenticado iniciar el proceso de baja de su propia cuenta.

## Alcance

- Incorporar la sección de baja de cuenta dentro de `SettingsPage`.
- Mantener la baja de la cuenta como una operación sobre la propia cuenta del usuario autenticado.
- Mostrar una advertencia antes de iniciar la operación.
- Incorporar el botón para iniciar la baja.
- Reutilizar los componentes existentes del Dashboard cuando corresponda.
- Incorporar los estados necesarios para representar las distintas etapas del flujo:
  - Estado inicial.
  - Solicitud de código.
  - Ingreso de código.
  - Baja confirmada.
- La baja de cuenta debe permanecer conceptualmente separada del logout.
- No implementar en esta task la confirmación efectiva de la baja.

## Criterios de aceptación

- [ ] La sección de baja de cuenta está disponible desde `SettingsPage`.
- [ ] La sección corresponde exclusivamente a la cuenta del usuario autenticado.
- [ ] Se muestra una advertencia antes de iniciar la operación.
- [ ] El botón permite iniciar el flujo.
- [ ] Los estados necesarios pueden representarse dentro de `SettingsPage`.
- [ ] No se modifica el comportamiento existente de logout.
- [ ] No se implementa todavía la confirmación efectiva de la baja.

## Execution Result

### Status
Finished

### Completed Work
- Se agregó la sección "Zona peligrosa" en `SettingsPage` del Dashboard.
- Se muestra advertencia antes de iniciar la baja de cuenta.
- Se incorporó el botón "Dar de baja la cuenta" para iniciar el flujo.
- Se agregaron los estados necesarios: `idle`, `code`, `confirm`.
- La baja de cuenta se mantiene conceptualmente separada del logout.
- No se modificó el comportamiento existente de logout.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- La sección está disponible desde `SettingsPage`.
- Corresponde exclusivamente a la cuenta del usuario autenticado.
- No se implementó la confirmación efectiva de la baja en esta task.

### Files Modified
- `dashboard/types/auth.ts` (modificado)
- `dashboard/features/authentication/services/auth.service.ts` (modificado)
- `dashboard/pages/settings-page.tsx` (modificado)

### Observations
- Los endpoints de backend ya estaban implementados y documentados en `project/endpoints.md`.
- Se reutilizaron componentes existentes como `OtpInputs`.
- El flujo respeta la arquitectura existente del Dashboard.
