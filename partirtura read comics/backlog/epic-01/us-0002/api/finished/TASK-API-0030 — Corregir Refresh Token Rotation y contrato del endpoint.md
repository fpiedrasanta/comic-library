# TASK-API-0030 — Corregir Refresh Token Rotation y contrato del endpoint

## Objetivo

Revisar y corregir la implementación actual del Refresh Token Rotation para asegurar que respete la arquitectura definida, utilice correctamente la configuración de la aplicación y mantenga la operación de renovación en un estado consistente.

También debe corregirse el contrato de respuesta del endpoint:

```text
POST /api/users/refresh-token
```

---

## 1. Utilizar IRefreshTokenSettingsProvider

La implementación actual de `RefreshTokenService` obtiene directamente la configuración mediante:

```text
_configuration.GetValue<int?>("RefreshToken:ExpirationDays")
```

Esto debe corregirse.

Ya existe:

```text
IRefreshTokenSettingsProvider
```

y su implementación concreta:

```text
RefreshTokenSettingsProvider
```

`RefreshTokenService` debe utilizar esta abstracción para obtener la configuración de expiración del Refresh Token.

La dependencia directa de `IConfiguration` para obtener:

```text
RefreshToken:ExpirationDays
```

debe eliminarse de `RefreshTokenService`.

La arquitectura debe mantenerse:

```text
Application
    ↓
IRefreshTokenSettingsProvider
    ↓
Infrastructure
    ↓
RefreshTokenSettingsProvider
```

---

## 2. No utilizar un valor por defecto silencioso

Eliminar cualquier comportamiento equivalente a:

```text
?? 7
```

para `RefreshToken:ExpirationDays`.

La configuración:

```text
RefreshToken:ExpirationDays
```

es obligatoria.

Si la configuración no existe o no tiene un valor válido, no debe utilizarse silenciosamente un valor alternativo.

Debe producirse un error de configuración que permita detectar el problema durante la ejecución.

No hardcodear una cantidad de días dentro del código.

---

## 3. Refresh Token Rotation transaccional

Revisar la implementación de:

```text
RenewAsync
```

y del flujo completo:

```text
POST /api/users/refresh-token
        ↓
AuthService.RefreshTokenAsync
        ↓
RefreshTokenService.RenewAsync
```

La renovación debe ser atómica.

La invalidación del Refresh Token anterior y la creación del nuevo Refresh Token deben formar parte de la misma operación transaccional.

El sistema no debe quedar en ninguno de estos estados:

```text
Token anterior revocado
+
Nuevo token no creado
```

ni:

```text
Nuevo token creado
+
Token anterior todavía válido
```

La operación debe utilizar el mecanismo de transacciones definido por el proyecto.

Debe garantizarse que:

```text
Validar token
    ↓
Invalidar token anterior
    ↓
Crear nuevo Refresh Token
    ↓
Persistir cambios
    ↓
Commit
```

sea una única operación atómica.

Si ocurre un error antes del commit:

```text
Rollback
```

debe dejar el estado anterior intacto.

---

## 4. Estado del Refresh Token anterior

Cuando un Refresh Token sea renovado correctamente, el token anterior debe quedar:

```text
IsUsed = true
RevokedAt = fecha actual UTC
```

El nuevo Refresh Token debe tener:

```text
IsUsed = false
RevokedAt = null
CreatedAt = fecha actual UTC
ExpiresAt = fecha actual UTC + RefreshToken:ExpirationDays
```

Todas las fechas deben utilizar UTC.

---

## 5. Validaciones del Refresh Token

`RenewAsync` debe continuar validando como mínimo:

- que el token exista;
- que el token corresponda a un usuario válido;
- que no esté revocado;
- que no haya sido utilizado anteriormente;
- que no esté expirado.

No debe generarse un nuevo Access Token ni un nuevo Refresh Token si alguna de estas validaciones falla.

Los errores deben mantener el comportamiento genérico definido para autenticación.

---

## 6. Contrato del endpoint

El endpoint:

```text
POST /api/users/refresh-token
```

actualmente retorna:

```text
ApiResponse<object>
```

Debe utilizar el DTO concreto:

```text
AuthResponse
```

La respuesta debe quedar tipada como:

```text
ApiResponse<AuthResponse>
```

No modificar `AuthResponse` solamente para realizar este cambio.

---

## 7. Actualizar endpoints.md

Verificar que:

```text
endpoints.md
```

documente el contrato real del endpoint:

```text
POST /api/users/refresh-token
```

Debe documentar:

### Request

```text
RefreshTokenRequest
```

con su propiedad:

```text
RefreshToken
```

### Response

```text
ApiResponse<AuthResponse>
```

La documentación debe coincidir exactamente con las propiedades existentes en `AuthResponse`.

También deben documentarse los errores esperados.

No utilizar `object` como tipo de respuesta documentado.

---

## 8. No implementar todavía Token Reuse Detection

Esta Task no debe introducir una política adicional para detectar el uso de un Refresh Token que ya fue revocado o utilizado.

Actualmente debe mantenerse el comportamiento:

```text
Refresh Token válido
        ↓
Rotation
        ↓
Token anterior invalidado
        ↓
Nuevo Refresh Token
```

Si se recibe posteriormente un Refresh Token ya utilizado o revocado:

```text
Refresh Token inválido
```

La implementación de una política de:

```text
Refresh Token Reuse Detection
```

queda fuera del alcance de esta Task y deberá definirse en una Task independiente si posteriormente se decide implementarla.

---

## Contexto obligatorio

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
- La implementación de `RefreshToken`.
- `IRefreshTokenRepository`.
- `RefreshTokenRepository`.
- `IRefreshTokenService`.
- `RefreshTokenService`.
- `IRefreshTokenSettingsProvider`.
- `RefreshTokenSettingsProvider`.
- `IAuthService`.
- `AuthService`.
- `AuthResponse`.
- `RefreshTokenRequest`.
- `UsersController`.

---

## Documentación

Si se modifica un servicio:

- Actualizar `services.md`.

Si se modifica un repositorio:

- Actualizar `repositories.md`.

Si se modifica un endpoint:

- Actualizar `endpoints.md`.

Si se modifica el modelo de dominio:

- Actualizar `domain.md`.

Si se establece una nueva regla general reutilizable:

- Actualizar `backend-coding-rules.md`.

No modificar otros documentos si no corresponde.

---

## Criterios de finalización

La Task se considera finalizada cuando:

1. `RefreshTokenService` no accede directamente a `IConfiguration` para obtener `RefreshToken:ExpirationDays`.
2. Utiliza `IRefreshTokenSettingsProvider`.
3. `RefreshToken:ExpirationDays` no tiene un valor por defecto hardcodeado.
4. Una configuración inexistente o inválida genera un error detectable.
5. Refresh Token Rotation es atómica.
6. La invalidación del token anterior y la creación del nuevo token forman parte de la misma transacción.
7. Un error durante la operación produce rollback.
8. El token anterior queda marcado como utilizado y revocado después de una rotación exitosa.
9. El nuevo token queda activo y con la expiración configurada.
10. Todas las fechas se manejan en UTC.
11. Se mantienen las validaciones existentes de expiración, revocación y uso previo.
12. `POST /api/users/refresh-token` retorna `ApiResponse<AuthResponse>`.
13. `endpoints.md` documenta `ApiResponse<AuthResponse>` y no `ApiResponse<object>`.
14. No se implementó Token Reuse Detection en esta Task.
15. Los documentos correspondientes fueron actualizados.
16. `Api`, `Application` e `Infrastructure` compilan correctamente.

---

## Resultado de la ejecución

### Cambios realizados

**`Infrastructure/Services/RefreshTokenService.cs`**
- Se reemplazó la dependencia directa de `IConfiguration` por `IRefreshTokenSettingsProvider`.
- `RenewAsync` ahora utiliza `_refreshTokenSettings.GetExpirationDays()` para obtener la expiración del Refresh Token.
- Se eliminó el fallback `?? 7`. Si `RefreshToken:ExpirationDays` no está configurado o tiene un valor inválido, `RefreshTokenSettingsProvider` lanzará un error detectable.
- Se mantuvo el manejo de fechas en UTC (`DateTime.UtcNow`).

**Atomicidad de Refresh Token Rotation**
- Verificado: la rotación es atómica por construcción.
- El flujo completo (`AuthService.RefreshTokenAsync` → `RefreshTokenService.RenewAsync`) opera sobre el mismo `DbContext`.
- El caller (`AuthService`) invoca `_unitOfWork.SaveChangesAsync(cancellationToken)` una única vez al final.
- Si ocurre un error antes del commit, no se persisten cambios parciales.
- No se introdujeron transacciones adicionales porque el mecanismo existente (`IUnitOfWork`) ya garantiza la atomicidad.

**Estado de tokens después de la rotación**
- Token anterior: `IsUsed = true`, `RevokedAt = DateTime.UtcNow`.
- Token nuevo: `IsUsed = false`, `RevokedAt = null`, `CreatedAt = DateTime.UtcNow`, `ExpiresAt = DateTime.UtcNow.AddDays(configurado)`.

**`Api/Controllers/UsersController.cs`**
- Se corrigió el endpoint `POST /api/users/refresh-token` para retornar `ApiResponse<AuthResponse>` en lugar de `ApiResponse<object>`.

**`project/endpoints.md`**
- Ya documentaba `ApiResponse<AuthResponse>` para `POST /api/users/refresh-token` desde TASK-API-0026.
- Se verificó que la documentación coincide con el contrato real implementado.

**`project/services.md`**
- Se actualizó la sección `RefreshTokenService` para reflejar la dependencia de `IRefreshTokenSettingsProvider` en lugar de `IConfiguration`.

### Verificación

- `Api` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- No se implementó Token Reuse Detection.
- No se agregaron configuraciones tecnológicas innecesarias.
