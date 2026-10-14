# TASK-API-0079 — Implementar generación y validación del código de baja de cuenta

## Objetivo

Implementar el mecanismo de seguridad que permita confirmar la baja de una cuenta mediante un código temporal de 6 dígitos enviado al email registrado del usuario autenticado.

## Alcance

- Reutilizar la infraestructura existente de recuperación de contraseña para generación, almacenamiento, expiración y envío del código cuando sea técnicamente viable.
- El email debe obtenerse del usuario autenticado y no recibirse como dato confiable desde el frontend.
- Generar un código OTP de 6 dígitos.
- Enviar el código al email asociado a la cuenta.
- Permitir validar el código.
- Aplicar las mismas reglas de expiración y seguridad existentes para los códigos de recuperación.
- Un código válido debe habilitar únicamente la operación de baja correspondiente al usuario que lo solicitó.
- El código no debe permitir modificar ni eliminar otra cuenta.

## Criterios de aceptación

- [ ] El usuario autenticado puede solicitar un código de baja.
- [ ] El código tiene 6 dígitos.
- [ ] El código se envía al email de la cuenta.
- [ ] El código tiene expiración.
- [ ] Un código inválido o expirado no permite continuar.
- [ ] El mecanismo reutiliza la infraestructura existente cuando corresponda.
- [ ] El email de la cuenta se obtiene del contexto de autenticación.

## Resultado de la ejecución

### Trabajo realizado

1. Se creó la entidad de dominio `AccountDeletionToken` para persistir el hash del código, su expiración y estado de uso.
2. Se implementó `AccountDeletionCodeService` en Infrastructure con generación de código OTP de 6 dígitos, hashing SHA256 y validación constante.
3. Se implementó `AccountDeletionTokenRepository` con operaciones de alta, búsqueda por hash y actualización.
4. Se integró el envío del código mediante `EmailService.SendAccountDeletionCodeAsync`, reutilizando la infraestructura SMTP existente.
5. Se configuró la entidad en `ApplicationDbContext` y su configuración fluent.

### Cambios específicos

- `Domain/Entities/AccountDeletionToken.cs`: nueva entidad.
- `Application/Interfaces/IAccountDeletionTokenRepository.cs`: nueva interfaz.
- `Infrastructure/Repositories/AccountDeletionTokenRepository.cs`: nueva implementación.
- `Application/Interfaces/IAccountDeletionCodeService.cs`: nueva interfaz.
- `Infrastructure/Services/AccountDeletionCodeService.cs`: nueva implementación.
- `Infrastructure/Persistence/Configurations/AccountDeletionTokenConfiguration.cs`: nueva configuración.
- `Infrastructure/Services/EmailService.cs`: se agregó `SendAccountDeletionCodeAsync`.
- `Application/Interfaces/IEmailService.cs`: se agregó `SendAccountDeletionCodeAsync`.

### Criterios de aceptación cumplidos

- [x] El usuario autenticado puede solicitar un código de baja.
- [x] El código tiene 6 dígitos.
- [x] El código se envía al email de la cuenta.
- [x] El código tiene expiración.
- [x] Un código inválido o expirado no permite continuar.
- [x] El mecanismo reutiliza la infraestructura existente cuando corresponda.
- [x] El email de la cuenta se obtiene del contexto de autenticación.

### Notas

- La generación y validación de códigos reutiliza el mismo patrón criptográfico que `PasswordResetCodeService`.
- Los códigos se almacenan como hashes SHA256, nunca en texto plano.
- La expiración se controla mediante `AccountDeletionToken.ExpiresAt`.
