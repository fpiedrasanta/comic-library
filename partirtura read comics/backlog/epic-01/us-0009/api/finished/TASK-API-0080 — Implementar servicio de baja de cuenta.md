# TASK-API-0080 — Implementar servicio de baja de cuenta

## Objetivo

Implementar el caso de uso que confirme la baja lógica de una cuenta a partir de un código OTP válido.

## Alcance

- Definir o ajustar el contrato del servicio de aplicación necesario.
- Validar que el usuario autenticado exista y se encuentre activo.
- Validar el código de confirmación.
- Ejecutar la baja lógica mediante `IsActive = false`.
- Invalidar todas las sesiones activas del usuario una vez confirmada la baja.
- Evitar que la operación pueda ejecutarse sobre una cuenta ya dada de baja.
- Mantener los datos históricos asociados al usuario.
- No realizar eliminación física de ninguna entidad.

## Criterios de aceptación

- [ ] Solo un usuario autenticado puede iniciar este flujo.
- [ ] La baja requiere un código válido.
- [ ] La cuenta pasa a `IsActive = false`.
- [ ] No se elimina físicamente el usuario.
- [ ] Todas las sesiones activas del usuario quedan invalidadas.
- [ ] El Refresh Token de cualquier sesión anterior deja de permitir autenticación.
- [ ] Una cuenta ya inactiva no puede volver a darse de baja mediante este flujo.

## Resultado de la ejecución

### Trabajo realizado

1. Se creó `AccountDeletionService` en Application para orquestar el flujo de baja.
2. Se implementó `RequestAsync`: solicita código de baja, invalida códigos previos activos, genera nuevo código, lo persiste y envía por email.
3. Se implementó `ConfirmAsync`: valida el código contra el hash almacenado, marca el token como usado, establece `IsActive = false` en el usuario y revoca todos los `RefreshToken` activos.
4. Se utilizó `IUnitOfWork` para confirmar los cambios en una sola operación transaccional.

### Cambios específicos

- `Application/DTOs/RequestAccountDeletionResponse.cs`: nuevo DTO.
- `Application/DTOs/ConfirmAccountDeletionResponse.cs`: nuevo DTO.
- `Application/Interfaces/IAccountDeletionService.cs`: nueva interfaz.
- `Application/Services/AccountDeletionService.cs`: nueva implementación.

### Criterios de aceptación cumplidos

- [x] Solo un usuario autenticado puede iniciar este flujo.
- [x] La baja requiere un código válido.
- [x] La cuenta pasa a `IsActive = false`.
- [x] No se elimina físicamente el usuario.
- [x] Todas las sesiones activas del usuario quedan invalidadas.
- [x] El Refresh Token de cualquier sesión anterior deja de permitir autenticación.
- [x] Una cuenta ya inactiva no puede volver a darse de baja mediante este flujo.

### Notas

- El servicio obtiene el usuario desde el repositorio por `userId` proporcionado por el controller, no desde el request body.
- La invalidación de sesiones reutiliza la misma lógica de revocación masiva de `RefreshToken` existente en el sistema.
- No se eliminan físicamente registros de `User`, `RefreshToken`, `PasswordResetToken` ni `AccountDeletionToken`.
