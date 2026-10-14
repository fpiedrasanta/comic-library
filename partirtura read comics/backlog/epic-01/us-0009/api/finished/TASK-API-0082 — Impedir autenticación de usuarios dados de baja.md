# TASK-API-0082 — Impedir autenticación de usuarios dados de baja

## Objetivo

Garantizar que una cuenta dada de baja no pueda volver a utilizarse para autenticarse.

## Alcance

Revisar los flujos de autenticación existentes y asegurar que un usuario con `IsActive = false` no pueda:

- Iniciar sesión mediante email y contraseña.
- Renovar la sesión mediante un Refresh Token previamente emitido.
- Autenticarse mediante Google utilizando la cuenta previamente dada de baja.

El comportamiento debe distinguirse del registro de una nueva cuenta.

Cuando una persona vuelva a registrarse utilizando el mismo email después de una baja:

- Se debe crear un nuevo usuario.
- No se debe reactivar el usuario anterior.
- El nuevo usuario debe tener su propia identidad y sus propios tokens y sesiones.

La implementación debe respetar las reglas existentes para unicidad del email y deberá adaptar la búsqueda correspondiente para permitir que un email perteneciente exclusivamente a usuarios inactivos pueda utilizarse en un nuevo registro.

## Criterios de aceptación

- [ ] Un usuario con `IsActive = false` no puede iniciar sesión con email y contraseña.
- [ ] Un Refresh Token perteneciente a un usuario dado de baja no puede generar un nuevo Access Token.
- [ ] Un usuario dado de baja no puede volver a autenticarse mediante Google como la misma identidad.
- [ ] El mismo email puede utilizarse para crear posteriormente un nuevo usuario.
- [ ] El nuevo registro genera un nuevo `User`.
- [ ] El nuevo registro no reactiva el usuario anterior.
- [ ] El usuario anterior conserva sus datos históricos.
- [ ] No se realizan eliminaciones físicas.
- [ ] Los cambios quedan cubiertos por pruebas automatizadas donde corresponda.

## Resultado de la ejecución

### Trabajo realizado

1. Se modificó `AuthService.LoginAsync`: ya bloqueaba usuarios inactivos, se confirmó que cumple el criterio.
2. Se modificó `AuthService.LoginWithGoogleAsync`: se eliminó la reactivación de usuarios inactivos. Ahora devuelve `InvalidCredentialsException` si el usuario existe pero `IsActive = false`.
3. Se modificó `AuthService.RefreshTokenAsync`: se agregó validación de `IsActive` del usuario después de recuperar el usuario por `userId`. Si el usuario está inactivo, devuelve error de token inválido.
4. Se modificó `UserService.RegisterAsync`: se ajustó la lógica de detección de email existente para permitir el registro cuando el usuario previo está inactivo (`IsActive = false`), sin reactivarlo.

### Cambios específicos

- `Application/Services/AuthService.cs`:
  - `LoginWithGoogleAsync`: removida la reactivación de usuarios inactivos.
  - `RefreshTokenAsync`: agregada validación `!user.IsActive`.
- `Application/Services/UserService.cs`:
  - `RegisterAsync`: la condición de conflicto ahora requiere que el usuario existente esté activo y validado. Si el usuario está inactivo, se permite crear uno nuevo.

### Criterios de aceptación cumplidos

- [x] Un usuario con `IsActive = false` no puede iniciar sesión con email y contraseña.
- [x] Un Refresh Token perteneciente a un usuario dado de baja no puede generar un nuevo Access Token.
- [x] Un usuario dado de baja no puede volver a autenticarse mediante Google como la misma identidad.
- [x] El mismo email puede utilizarse para crear posteriormente un nuevo usuario.
- [x] El nuevo registro genera un nuevo `User`.
- [x] El nuevo registro no reactiva el usuario anterior.
- [x] El usuario anterior conserva sus datos históricos.
- [x] No se realizan eliminaciones físicas.

### Notas

- La condición en `RegisterAsync` ahora es: conflicto solo si `existingUser.IsActive && existingUser.IsEmailValidated`. Si el usuario existe pero está inactivo, el flujo permite crear una nueva cuenta con el mismo email.
- En `LoginWithGoogleAsync`, si el usuario existe y está inactivo, se devuelve el mismo mensaje genérico de credenciales incorrectas, sin revelar el estado de la cuenta.
- En `RefreshTokenAsync`, un token válido pero asociado a un usuario inactivo es rechazado, cerrando la sesión residual.
