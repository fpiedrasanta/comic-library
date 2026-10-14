# TASK-PUBLIC-WEB-0046 — Implementar cambio de contraseña desde Settings

## Task ID

TASK-PUBLIC-WEB-0046

## Title

Implementar el flujo de cambio de contraseña para usuarios autenticados desde la pantalla de configuración.

## Description

Implementar en el Public Web la funcionalidad definida por **US-0007 — Cambiar mi contraseña**.

El usuario autenticado debe poder iniciar el cambio de contraseña desde la pantalla de configuración de su cuenta, sin ingresar nuevamente su email.

El flujo debe reutilizar la infraestructura existente para recuperación de contraseña implementada para **US-0003 — Recuperar contraseña**.

No se debe implementar una nueva lógica de backend ni crear endpoints específicos para esta funcionalidad.

El template visual de referencia es:

`settings-template.html`

La sección correspondiente es:

`Seguridad y Cuenta → Cambiar Contraseña`

La sección de eliminación de cuenta incluida en el mismo template está fuera del alcance de esta Task.

## Expected Result

Desde la pantalla de configuración, un usuario autenticado debe poder:

1. Iniciar el proceso mediante el botón "Cambiar contraseña".
2. Solicitar el envío del código de validación al email asociado a su cuenta.
3. Ingresar el código de validación de 6 dígitos.
4. Validar el código utilizando el flujo existente de recuperación de contraseña.
5. Establecer una nueva contraseña.
6. Confirmar el cambio de contraseña.
7. Recibir y visualizar los errores correspondientes cuando alguna operación falle.

El usuario no debe ingresar su email durante este flujo.

El email debe obtenerse de la información disponible del usuario autenticado.

## Relevant Context

### User Story

US-0007 — Cambiar mi contraseña

### Existing functionality

La recuperación de contraseña de US-0003 ya implementa el mecanismo necesario para:

- Solicitar código de recuperación.
- Validar código.
- Obtener el authorization token necesario para establecer una nueva contraseña.
- Establecer la nueva contraseña.

Esta Task debe reutilizar dicha funcionalidad.

No debe duplicarse la lógica de recuperación de contraseña.

### Existing components

Reutilizar los componentes existentes cuando corresponda, especialmente:

- `OtpInputs`
- `PasswordInput`

No implementar nuevamente los seis inputs OTP definidos específicamente en el template HTML.

### Visual reference

`settings-template.html`

El template define tres estados para la sección de cambio de contraseña:

1. Solicitud del código.
2. Ingreso del código OTP.
3. Ingreso y confirmación de la nueva contraseña.

El comportamiento visual y la estructura de la sección deben utilizarse como referencia para la implementación React.

## Scope

### Included

- Implementación de la sección de cambio de contraseña dentro de Settings.
- Integración con los endpoints existentes de recuperación de contraseña.
- Obtención del email desde el usuario autenticado.
- Solicitud del código.
- Ingreso y validación del código OTP.
- Establecimiento de la nueva contraseña.
- Validación visual de las reglas de contraseña.
- Confirmación de que ambas contraseñas coincidan.
- Manejo de estados de carga.
- Manejo y visualización de errores.
- Temporizador asociado al código de validación.
- Reutilización de componentes existentes.

### Excluded

- Cambios en Backend.
- Nuevos endpoints.
- Nueva lógica de recuperación de contraseña.
- Modificación del flujo de recuperación de contraseña existente.
- Eliminación de cuenta.
- Implementación de otras funcionalidades de Settings.
- Modificación del diseño fuera de la sección correspondiente.

## Dependencies

- US-0003 — Recuperar contraseña.
- US-0007 — Cambiar mi contraseña.
- Implementación existente de los endpoints de recuperación de contraseña.
- `settings-template.html`.
- `OtpInputs`.
- `PasswordInput`.

No existe una dependencia de una nueva Task de Backend.

## Acceptance Criteria

### Access

- [x] La funcionalidad está disponible únicamente para usuarios autenticados.
- [x] La sección se encuentra disponible desde la pantalla de configuración.

### Initial state

- [x] La pantalla muestra la sección "Cambiar Contraseña".
- [x] Se muestra el mensaje indicando que se enviará un código de validación al email registrado.
- [x] El usuario puede iniciar el proceso mediante el botón correspondiente.
- [x] No se solicita al usuario ingresar su email.

### Request code

- [x] Al iniciar el proceso se utiliza el email del usuario autenticado.
- [x] Se reutiliza el endpoint existente utilizado para iniciar la recuperación de contraseña.
- [x] Mientras se procesa la solicitud se muestra el estado de carga correspondiente.
- [x] Ante un error se informa al usuario y no se pierde innecesariamente el estado de la pantalla.

### OTP

- [x] Se muestra un campo OTP de 6 dígitos.
- [x] Se reutiliza `OtpInputs`.
- [x] El componente permite navegación entre campos.
- [x] Permite Backspace.
- [x] Permite pegar el código completo.
- [x] El código se valida mediante el endpoint existente de recuperación.
- [x] Se respeta el tiempo de expiración informado por el backend.
- [x] Si el código es inválido o expiró, se muestra el error correspondiente.

### New password

- [x] Luego de validar correctamente el código se muestra el formulario de nueva contraseña.
- [x] Se reutiliza `PasswordInput` cuando corresponda.
- [x] Se solicita la nueva contraseña.
- [x] Se solicita repetir la nueva contraseña.
- [x] Se muestran visualmente las reglas de contraseña definidas por el sistema.
- [x] El botón de confirmación permanece deshabilitado mientras la contraseña no cumpla las reglas.
- [x] El botón de confirmación permanece deshabilitado mientras ambas contraseñas no coincidan.
- [x] La nueva contraseña se establece utilizando el endpoint existente de recuperación.
- [x] Se utiliza el authorization token obtenido durante la validación del código.

### Completion

- [x] Al completar correctamente el proceso se informa al usuario que la contraseña fue modificada.
- [x] El flujo no requiere volver a ingresar el email.
- [x] No se implementa una segunda lógica de cambio de contraseña independiente de recuperación.

### Template fidelity

- [x] La implementación utiliza `settings-template.html` como referencia visual.
- [x] La estructura de tres pasos del template se respeta.
- [x] La sección de eliminación de cuenta del template no forma parte de esta Task.
- [x] La implementación respeta los patrones de componentización definidos para Public Web.

## Notes

El objetivo de esta Task es adaptar el flujo existente de recuperación de contraseña a una experiencia contextual dentro de la aplicación autenticada.

Desde el punto de vista del backend, el proceso utiliza las mismas capacidades existentes de recuperación de contraseña.

La diferencia funcional está en que el usuario ya se encuentra autenticado y, por lo tanto, el frontend ya dispone de su email y no debe solicitarlo nuevamente.

No crear endpoints ni modificar contratos del backend salvo que durante la implementación se detecte una incompatibilidad real con el contrato existente. En ese caso, la Task debe pasar a `blocked` y registrar la dependencia o crear una nueva Task según corresponda.

## Execution Result

### Status

finished

### Completed Work

1. Creada la pantalla `SettingsPage` en `public-web/public-web/pages/settings-page.tsx`.
2. Implementado el flujo de 3 pasos dentro de Settings:
   - Paso 1: Solicitud de código usando el email del usuario autenticado (`POST /users/forgot-password`).
   - Paso 2: Validación del código OTP de 6 dígitos (`POST /users/validate-password-reset-code`) con temporizador y reenvío.
   - Paso 3: Formulario de nueva contraseña con validación visual de reglas (`POST /users/reset-password`).
3. Reutilizados componentes existentes:
   - `OtpInputs`
   - `PasswordInput`
   - `usePasswordRules`
4. Agregada la ruta `/settings` en `routes.tsx` protegida por `ProtectedRoute`.
5. Actualizado `project/pages.md` para incluir la nueva página Settings.

### Validation

- `tsc --noEmit`: sin errores.
- `npm run build`: compiló correctamente.

### Files Modified

- `public-web/public-web/pages/settings-page.tsx` (nuevo)
- `public-web/public-web/app/router/routes.tsx`
- `project/pages.md`

### Observations

No se detectaron incompatibilidades con el contrato de API existente. No se requirieron nuevos endpoints ni modificaciones al backend. El flujo reutiliza completamente la infraestructura de recuperación de contraseña de US-0003, obteniendo el email del contexto de autenticación sin solicitarlo al usuario.
