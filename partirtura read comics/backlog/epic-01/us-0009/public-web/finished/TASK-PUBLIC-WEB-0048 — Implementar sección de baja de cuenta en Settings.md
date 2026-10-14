# TASK-PUBLIC-WEB-0048 — Implementar sección de baja de cuenta en Settings

## Objetivo

Implementar en `SettingsPage` la sección de baja de cuenta definida en el template `settings-template.html`.

## Alcance

- Incorporar la sección **"Zona Peligrosa: Dar de baja la cuenta"**.
- Mantener el diseño visual definido en el template.
- Mostrar la advertencia correspondiente antes de iniciar la operación.
- Incorporar el botón **"Dar de baja la cuenta"**.
- Reutilizar los componentes existentes del Public Web cuando corresponda.
- Incorporar los estados necesarios para representar las distintas etapas del flujo:
  - Estado inicial.
  - Solicitud de código.
  - Ingreso de código.
  - Baja confirmada.
- La sección de cambio de contraseña existente no debe modificarse salvo que sea necesario para compartir componentes.
- La funcionalidad de baja de cuenta debe permanecer separada de la funcionalidad de logout.

## Criterios de aceptación

- [x] La sección de baja de cuenta está disponible desde `SettingsPage`.
- [x] El diseño respeta el template proporcionado.
- [x] La advertencia se muestra antes de iniciar la operación.
- [x] El botón permite iniciar el flujo de baja.
- [x] Los estados de la operación pueden representarse sin abandonar `SettingsPage`.
- [x] No se implementa todavía la confirmación efectiva de la baja.
- [x] No se modifica el comportamiento del cambio de contraseña.

## Execution Result

### Status

finished

### Completed Work

1. Agregada la sección **"Zona Peligrosa: Dar de baja la cuenta"** en `SettingsPage` (`public-web/public-web/pages/settings-page.tsx`).
2. La sección incluye:
   - Estado inicial con advertencia y botón "Dar de baja la cuenta".
   - Estados de solicitud de código, ingreso OTP y baja confirmada.
3. El diseño respeta `settings-template.html` (sección 2).
4. La sección permanece separada de cambio de contraseña y cierre de sesión.

### Validation

- `npm run build`: compiló correctamente.

### Files Modified

- `public-web/public-web/pages/settings-page.tsx`
