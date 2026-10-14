# TASK-API-0039 — Implementar solicitud y reenvío del código de recuperación

## Objetivo

Implementar en Application el caso de uso para solicitar la recuperación de contraseña y reenviar el código de recuperación.

El flujo debe:

1. Recibir un email.
2. Buscar el usuario.
3. Verificar que el usuario pueda participar del proceso de recuperación.
4. Invalidar códigos anteriores.
5. Generar un nuevo código de 6 dígitos.
6. Persistir su hash y fecha de expiración.
7. Enviar el código por email.
8. Devolver la información necesaria para que el frontend pueda mostrar el temporizador.

---

## Contexto obligatorio

Leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `epic-01.md`
- `us-0003.md`

Revisar:

- `UserService`
- `UserRepository`
- servicio existente de email;
- servicio de generación/hash;
- UnitOfWork;
- flujo de validación de email.

---

## Regla de seguridad

La API no debe revelar si un email existe o no.

La respuesta pública debe ser equivalente para:

- email inexistente;
- email existente pero no habilitado para recuperación;
- email existente y habilitado.

No devolver:

```text
"El email no existe."
```

ni:

```text
"El usuario existe pero no está validado."
```

El endpoint debe utilizar un mensaje genérico apropiado.

---

## Generación del código

El Application Service debe utilizar el servicio técnico correspondiente para generar el código.

No generar el código directamente dentro del Controller.

No generar el código dentro del Repository.

---

## Invalidación de códigos anteriores

Antes de generar un nuevo código:

- identificar los códigos vigentes del usuario;
- invalidarlos;
- generar el nuevo código;
- persistirlo.

No debe existir más de un código utilizable simultáneamente para el mismo proceso.

Los códigos históricos pueden permanecer almacenados para auditoría, pero no deben poder utilizarse.

---

## Envío de email

Utilizar el servicio de email existente.

Los templates específicos de recuperación de contraseña son:

```text
Api/EmailTemplates/password-reset.html
Api/EmailTemplates/password-reset.txt
```

Utilizar:

- `password-reset.html` para el cuerpo HTML;
- `password-reset.txt` para el cuerpo de texto plano.

El código de 6 dígitos debe insertarse en ambos templates mediante el mecanismo de templating existente.

No crear un nuevo mecanismo de envío de email.

---

## Temporizador

La respuesta debe incluir la información necesaria para que el frontend pueda determinar cuánto tiempo permanece vigente el código.

El backend debe devolver el dato derivado de la expiración real del código.

No devolver un valor hardcodeado.

La información debe permitir al frontend mostrar correctamente el temporizador.

---

## Application y UnitOfWork

El Application Service debe ser quien orqueste:

```text
Repository
    ↓
Generador de código
    ↓
Persistencia
    ↓
Email Service
    ↓
UnitOfWork
```

No crear un Infrastructure Service que encapsule este flujo.

El Application Service debe controlar explícitamente la persistencia.

---

## Reenvío

El reenvío debe utilizar el mismo flujo de generación:

- invalidar código anterior;
- generar nuevo código;
- persistir nuevo hash;
- actualizar expiración;
- enviar nuevo email;
- devolver nueva expiración.

El código anterior debe quedar inutilizable inmediatamente.

---

## Documentación

Actualizar:

- `services.md`
- `endpoints.md`

Si se incorpora una nueva configuración:

- actualizar el documento correspondiente de configuración;
- no agregarla a `backend-stack-technology.md`.

---

## Criterios de finalización

1. Existe un caso de uso para solicitar recuperación.
2. Existe un caso de uso para reenviar el código.
3. No se revela si el email existe.
4. El código generado tiene exactamente 6 dígitos.
5. Solo existe un código vigente utilizable.
6. El código anterior queda invalidado al reenviar.
7. Se utiliza el servicio de email existente.
8. Se utilizan los templates:
   - `Api/EmailTemplates/password-reset.html`
   - `Api/EmailTemplates/password-reset.txt`
9. La expiración devuelta corresponde a la expiración real.
10. El frontend puede utilizar la respuesta para mostrar el temporizador.
11. Application controla la orquestación.
12. No existe un servicio de Infrastructure que llame a repositories.
13. La persistencia es controlada mediante UnitOfWork.
14. `Application` e `Infrastructure` compilan.
15. La documentación está actualizada.

---

## Resultado de la ejecución

### Cambios realizados

**`Application/DTOs/RequestPasswordResetRequest.cs`** (nuevo)
- DTO de request con propiedad `Email`.

**`Application/DTOs/RequestPasswordResetResponse.cs`** (nuevo)
- DTO de response con `ExpiresInMinutes`.

**`Application/DTOs/ResendPasswordResetRequest.cs`** (nuevo)
- DTO de request con propiedad `Email`.

**`Application/DTOs/ResendPasswordResetResponse.cs`** (nuevo)
- DTO de response con `ExpiresInMinutes`.

**`Application/Interfaces/IPasswordResetService.cs`** (nuevo)
- Interfaz con `RequestResetAsync` y `ResendResetAsync`.

**`Application/Services/PasswordResetService.cs`** (nuevo)
- Implementación que orquesta el caso de uso:
  - Busca el usuario por email.
  - Verifica que exista y tenga email validado.
  - Invalida códigos anteriores activos.
  - Genera nuevo código de 6 dígitos usando `IPasswordResetCodeService`.
  - Envía email usando `IEmailService` con templates específicos.
  - **Persiste los cambios solo después de que el envío de email sea exitoso** (`SaveChangesAsync` al final).
  - Retorna `ExpiresInMinutes` para el temporizador.
- No revela si el email existe (usa error genérico).

**`Api/DTOs/RequestPasswordResetApiRequest.cs`** (nuevo)
- DTO de request para el controller con validación `[Required]` y `[EmailAddress]`.

**`Api/DTOs/ResendPasswordResetApiRequest.cs`** (nuevo)
- DTO de request para el controller con validación `[Required]` y `[EmailAddress]`.

**`Api/Controllers/UsersController.cs`** (modificado)
- Se inyectó `IPasswordResetService`.
- Se agregó `POST /api/users/request-password-reset`.
- Se agregó `POST /api/users/resend-password-reset`.
- Ambos endpoints retornan `ApiResponse<object>` con mensaje genérico.

**`Api/EmailTemplates/password-reset.html`** (nuevo)
- Template HTML para el email de recuperación de contraseña.

**`Api/EmailTemplates/password-reset.txt`** (nuevo)
- Template de texto plano para el email de recuperación de contraseña.

**`Application/Interfaces/IEmailService.cs`** (modificado)
- Se agregó `SendEmailAsync(string to, string subject, string htmlBody, string textBody, CancellationToken)`.

**`Infrastructure/Services/EmailService.cs`** (modificado)
- Se refactorizó `SendEmailValidationAsync` para reutilizar `SendEmailAsync`.
- Se agregó `SendEmailAsync` como método público para envío genérico de emails.

**`project/services.md`** (actualizado)
- Se agregó la entrada `IPasswordResetService / PasswordResetService`.

**`project/endpoints.md`** (actualizado)
- Se agregó documentación de `POST /api/users/request-password-reset`.
- Se agregó documentación de `POST /api/users/resend-password-reset`.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- No se revela información sensible en errores.
- La documentación refleja el comportamiento implementado.

### Nota sobre atomicidad

El `SaveChangesAsync` se ejecuta **después** del envío del email. Si el envío falla, no se persiste nada en la base de datos. Esto garantiza que el usuario reciba el código solo cuando el token haya sido guardado correctamente. Si el email falla, el usuario puede reintentar sin que queden estados inconsistentes en la base de datos.
