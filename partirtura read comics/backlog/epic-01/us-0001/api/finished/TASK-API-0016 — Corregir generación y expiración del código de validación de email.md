# TASK-API-0016 — Corregir generación y expiración del código de validación de email

## Objetivo

Corregir la generación y la información de expiración del código de validación de email utilizado durante el registro de usuarios.

Actualmente existen dos problemas:

1. El código enviado al usuario no tiene el formato requerido.
2. El tiempo de expiración informado en el correo es incorrecto.

## 1. Código de validación

El código de validación debe ser:

- Numérico.
- Exactamente de 6 dígitos.
- Generado específicamente para la validación del email.
- No debe utilizar un GUID como código visible para el usuario.

Ejemplo válido:

```text
583214
```

Ejemplos inválidos:

```text
5b628e49-8b0d-43f0-bdcb-c62180c19645
12345
1234567
ABC123
```

El código almacenado internamente puede utilizar el mecanismo que resulte adecuado para la implementación, pero el código que recibe el usuario debe ser siempre un número de exactamente 6 dígitos.

## 2. Expiración del código

La configuración actual establece:

```json
"TokenExpirationMinutes": 1
```

Por lo tanto, el código debe tener una vigencia de 60 segundos.

Actualmente el correo muestra:

```text
El código vence en 0 segundos.
```

inmediatamente después de recibirlo.

Esto es incorrecto.

El correo debe informar correctamente el tiempo de vigencia del código.

Por ejemplo, inmediatamente después de generar el código:

```text
El código vence en 60 segundos.
```

La configuración debe continuar siendo la fuente de la duración.

No hardcodear `60` segundos.

## 3. Validación del código

El backend debe validar:

1. Que el código recibido tenga exactamente 6 dígitos.
2. Que el código corresponda al usuario y proceso de validación correspondiente.
3. Que el código no haya expirado.
4. Que el código no pueda utilizarse después de su expiración.
5. Que la duración continúe siendo configurable mediante `TokenExpirationMinutes`.

## 4. Reenvío del código

La implementación debe mantener compatibilidad con el mecanismo de reenvío del código.

Cada nuevo código generado debe:

- Tener exactamente 6 dígitos.
- Tener una nueva vigencia completa.
- Invalidar el código anterior, según las reglas definidas para el proceso de validación.

## 5. Correo electrónico

Actualizar el contenido enviado por email para que muestre el código de 6 dígitos y el tiempo de expiración correcto.

Ejemplo:

```text
TU CÓDIGO DE VERIFICACIÓN

583214

El código vence en 60 segundos.
```

El valor mostrado debe corresponder al código y tiempo de expiración reales utilizados por el backend.

## Restricciones

No modificar:

- La lógica del frontend.
- La arquitectura existente.
- El flujo de navegación del usuario.

Si para corregir esta Task es necesario modificar un contrato existente, registrar explícitamente el cambio en esta Task y actualizar `endpoints.md`.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente.
- La User Story correspondiente.

Leer además la implementación actual de:

- Registro de usuario.
- Generación del código de validación.
- Persistencia del código.
- Validación del código.
- Envío del email.
- Template del email de validación.

## Documentación

Si como resultado de la implementación se modifica:

- El modelo de dominio → actualizar `domain.md`.
- Un servicio → actualizar `services.md`.
- Un repositorio → actualizar `repositories.md`.
- Un endpoint → actualizar `endpoints.md`.
- Una regla general reutilizable → actualizar `backend-coding-rules.md`.
- Una dependencia → actualizar `backend-stack-technology.md`.

## Criterio de finalización

La Task se considera finalizada cuando:

1. El usuario recibe un código de exactamente 6 dígitos numéricos.
2. El código no es un GUID.
3. El código tiene una vigencia configurable.
4. Con `TokenExpirationMinutes = 1`, la vigencia es de aproximadamente 60 segundos.
5. El email informa correctamente el tiempo de expiración.
6. El código es rechazado una vez expirado.
7. El código puede ser validado correctamente mientras está vigente.
8. El reenvío genera un nuevo código con una nueva vigencia.
9. No existen inconsistencias entre el tiempo de expiración configurado, el tiempo utilizado para validar el código y el tiempo informado al usuario.
10. Se actualizaron los documentos correspondientes si la implementación produjo cambios en ellos.

---

## Resultado de la ejecución

### Cambios realizados

**UserService (`Application/Services/UserService.cs`)**
- Se reemplazó `Guid.NewGuid().ToString()` por `GenerateValidationCode()`, que genera un número aleatorio de exactamente 6 dígitos utilizando `Random.Shared.Next(100000, 999999)`.
- Se actualizó `RegisterAsync` para utilizar el nuevo código de 6 dígitos.
- Se actualizó `ResendValidationEmailAsync` para utilizar el nuevo código de 6 dígitos.
- Se agregó validación en `ValidateEmailAsync` para rechazar códigos que no tengan exactamente 6 dígitos numéricos.

**EmailTokenSettingsProvider (`Infrastructure/Settings/EmailTokenSettingsProvider.cs`)**
- Se corrigió la ruta de configuración de `"Email:TokenExpirationMinutes"` a `"ValidationMailContent:TokenExpirationMinutes"` para coincidir con la configuración definida en `appsettings.json`.

**EmailService (`Infrastructure/Services/EmailService.cs`)**
- Se corrigió el placeholder `{{time to expire}}` para mostrar `expiresInMinutes * 60` segundos en lugar de `expiresInMinutes` segundos. Con `TokenExpirationMinutes = 1`, el correo ahora muestra correctamente `60 segundos`.

**Documentación**
- `services.md`: Se actualizó la descripción de `UserService` para reflejar la generación de códigos de 6 dígitos.
- `endpoints.md`: Se actualizaron las notas del endpoint `POST /api/users/validate-email` para indicar que el código debe ser exactamente 6 dígitos numéricos.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- La configuración `TokenExpirationMinutes` continúa siendo la fuente de la duración.
- El flujo de registro, validación y reenvío mantiene compatibilidad con la arquitectura existente.
