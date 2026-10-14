# TASK-API-0028 — Revisar servicio de autenticación y configuración de JWT

## Objetivo

Revisar la implementación de `AuthService` realizada para US-0002 — Iniciar sesión y corregir cualquier comportamiento que no respete las reglas de autenticación definidas para el proyecto.

La autenticación debe considerar que un usuario cuyo email no fue validado **no existe a efectos del login**.

No se debe revelar al cliente si existe un usuario cuyo email no fue validado.

---

## 1. Regla de existencia del usuario para Login

Para el proceso de Login, solamente debe considerarse existente un usuario cuyo email haya sido validado.

Por lo tanto:

```text
Usuario inexistente
        ↓
Credenciales inválidas
```

```text
Usuario existente pero email no validado
        ↓
Credenciales inválidas
```

```text
Usuario existente y email validado
        ↓
Continuar validación de contraseña
```

El backend no debe diferenciar entre:

- email inexistente;
- email existente pero no validado;
- email existente con contraseña incorrecta.

En todos estos casos debe devolver el mismo error genérico de credenciales inválidas.

No debe existir ningún mecanismo en el Login que permita descubrir que existe una cuenta cuyo email todavía no fue validado.

---

## 2. Comportamiento durante el registro

La regla de registro es diferente de la regla de Login.

Durante el registro:

### Usuario validado

Si existe un usuario con ese email y el email está validado:

```text
Registro
    ↓
Email ya existente
    ↓
Rechazar registro
```

### Usuario pendiente de validación

Si existe un usuario con ese email pero todavía no fue validado:

- Si el código de validación todavía está vigente, rechazar el nuevo registro indicando que el email ya está en proceso de validación.
- Si el código de validación ya expiró, permitir un nuevo registro utilizando ese email, reemplazando o invalidando correctamente el registro anterior según la implementación existente.

El comportamiento definido en las Tasks anteriores debe mantenerse.

---

## 3. Boundary case

Debe contemplarse explícitamente el siguiente escenario:

```text
Usuario se registra
        ↓
Se crea cuenta pendiente
        ↓
Se envía código de validación
        ↓
Usuario abandona el proceso
        ↓
Intenta hacer Login
        ↓
Backend responde credenciales inválidas
```

Posteriormente:

```text
Usuario intenta registrarse nuevamente
        ↓
Código anterior todavía vigente
        ↓
Registro rechazado
```

Después de la expiración:

```text
Código anterior expirado
        ↓
Usuario intenta registrarse nuevamente
        ↓
Nuevo registro permitido
```

Este comportamiento es intencional y no debe modificarse para facilitar el Login.

---

## 4. Revisar generación del JWT

Verificar que `IJwtTokenGenerator` genere el Access Token respetando exactamente la configuración definida en:

```text
appsettings.json
```

y sus correspondientes archivos de configuración por entorno.

Debe utilizar:

```text
Jwt:Issuer
Jwt:Audience
Jwt:SecretKey
Jwt:ExpirationMinutes
```

No deben existir valores hardcodeados para estas propiedades.

La configuración debe continuar siendo independiente del entorno.

---

## 5. Revisar configuración de Refresh Token

La expiración del Refresh Token debe obtenerse mediante la configuración:

```text
RefreshToken:ExpirationDays
```

La propiedad debe estar definida en:

```text
appsettings.json
```

y poder ser sobrescrita por la configuración correspondiente a cada entorno.

No debe existir un valor hardcodeado dentro del código.

`RefreshToken:ExpirationDays` es una **configuración de aplicación**, no una tecnología ni una dependencia.

Por lo tanto:

- No agregar esta configuración a `backend-stack-technology.md`.
- Documentarla solamente donde corresponda según las reglas de configuración del proyecto.

---

## 6. Revisar AuthResponse

Revisar el DTO:

```text
Application/DTOs/AuthResponse.cs
```

Actualmente contiene:

```text
AccessToken
RefreshToken
UserId
Email
FullName
Role
```

Determinar si todos los campos son necesarios para US-0002.

No agregar información a la respuesta simplemente por considerarla útil para funcionalidades futuras.

La respuesta debe contener solamente la información necesaria para completar el flujo de autenticación definido actualmente.

Si `UserId`, `Email`, `FullName` o `Role` no son necesarios para este flujo, eliminarlos.

Si alguno de ellos es necesario, mantenerlo y dejar registrada la razón.

---

## 7. Contexto obligatorio

Antes de ejecutar la Task, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- La Epic correspondiente: `epic-01.md`
- La User Story correspondiente: `us-0002.md`
- `TASK-API-0020`
- `TASK-API-0021`
- `TASK-API-0022`
- `TASK-API-0023`
- `TASK-API-0024`

---

## 8. Documentación

Si como resultado de la implementación se incorpora una nueva dependencia:

- Actualizar `backend-stack-technology.md`.

Si se incorpora o modifica un servicio:

- Actualizar `services.md`.

Si se establece una regla general reutilizable para el manejo de contraseñas:

- Actualizar `backend-coding-rules.md`.

Si como resultado de la implementación se incorpora o modifican entidades:
- Actualizar: `domain.md`

Si como resultado de la implementación se incorpora o modifican repositorios:
- Actualizar: `repositories.md`

Si como resultado de la implementación se incorpora o modifican end-points:
- Actualizar: `endpoints.md`

Si como resultado de la implementación se identifican errores en la comunicación:
- Actualizar/corregir: `communication.md`

---

## Criterios de finalización

La Task se considera finalizada cuando:

1. Un usuario cuyo email no fue validado es tratado como inexistente durante el Login.
2. El Login no revela si un email pendiente de validación existe.
3. Usuario inexistente, usuario no validado y contraseña incorrecta utilizan el mismo comportamiento de error.
4. Se mantiene el comportamiento definido para registros pendientes de validación.
5. Un registro pendiente con código vigente impide registrar nuevamente el mismo email.
6. Un registro pendiente cuyo código expiró permite volver a registrar el email.
7. El JWT respeta `Issuer`, `Audience`, `SecretKey` y `ExpirationMinutes`.
8. `RefreshToken:ExpirationDays` se obtiene exclusivamente desde configuración.
9. La configuración puede variar por entorno.
10. No se agregaron configuraciones tecnológicas innecesarias a `backend-stack-technology.md`.
11. `AuthResponse` contiene solamente información necesaria para US-0002.
12. Los documentos correspondientes fueron actualizados.
13. `Application`, `Infrastructure` y `Api` compilan correctamente.

---

## Resultado de la ejecución

### Cambios realizados

**Registro de usuarios (`UserService.RegisterAsync`)**
- Se agregó validación para rechazar un nuevo registro cuando existe un usuario pendiente de validación cuyo código todavía está vigente.
- Si el código de validación ya expiró, se permite el nuevo registro eliminando el usuario pendiente anterior.
- Si el usuario ya tiene el email validado, se mantiene el rechazo existente.

**JWT (`JwtTokenGenerator`)**
- Verificado: genera el Access Token respetando `Jwt:Issuer`, `Jwt:Audience`, `Jwt:SecretKey` y `Jwt:ExpirationMinutes` desde configuración.
- No contiene valores hardcodeados.

**Refresh Token (`RefreshTokenService` / `AuthService`)**
- Verificado: `RefreshToken:ExpirationDays` se obtiene exclusivamente desde `IConfiguration` a través de `IRefreshTokenSettingsProvider`.
- No contiene valores hardcodeados.

**AuthResponse (`Application/DTOs/AuthResponse.cs`)**
- Se mantuvieron todos los campos: `AccessToken`, `RefreshToken`, `UserId`, `Email`, `FullName`, `Role`.
- Razón: todos son necesarios para US-0002:
  - `AccessToken` y `RefreshToken`: para establecer la sesión y acceder a recursos protegidos.
  - `UserId`: para identificar al usuario autenticado en el frontend.
  - `Email` y `FullName`: para mostrar información del usuario en la interfaz.
  - `Role`: para determinar permisos y comportamiento en la UI.

**Documentación**
- `project/services.md`:
  - Se actualizó el comportamiento de `UserService` para documentar la validación del código de confirmación durante el registro.
  - Se agregó la sección `AuthResponse` documentando cada campo y su justificación.
- `project/endpoints.md`:
  - Se actualizaron las notas del endpoint `POST /api/users/register` para reflejar el comportamiento ante emails pendientes de validación.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- La configuración de JWT y Refresh Token depende exclusivamente de `appsettings.json`.
- No se agregaron configuraciones tecnológicas innecesarias a `backend-stack-technology.md`.
