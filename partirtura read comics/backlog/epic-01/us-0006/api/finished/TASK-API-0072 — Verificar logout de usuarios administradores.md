# TASK-API-0072 — Verificar logout de usuarios administradores

## Objetivo

Revisar que el mecanismo de cierre de sesión existente funcione correctamente para usuarios con rol `Administrator`, sin introducir un mecanismo de logout específico para el Dashboard.

La implementación debe reutilizar el mecanismo de logout existente para todos los usuarios autenticados.

## Alcance

Verificar específicamente:

- Revocación del Refresh Token utilizado durante la sesión.
- Invalidación del Refresh Token cuando corresponde.
- Eliminación de la cookie `HttpOnly` del Refresh Token.
- Comportamiento idempotente del logout.
- Compatibilidad con Refresh Token Rotation.
- Ausencia de lógica específica innecesaria para administradores.
- Correcta protección de la información sensible.

## Verificaciones

### Logout de administrador autenticado

Verificar que un usuario con rol `Administrator` pueda cerrar sesión utilizando el endpoint de logout existente.

El logout no debe requerir:

- Un endpoint específico para administradores.
- Un parámetro indicando que el usuario es administrador.
- Información adicional enviada desde el Dashboard para identificar el rol.
- Un mecanismo de autenticación diferente.

La identidad del usuario debe continuar determinándose mediante la sesión existente.

### Revocación del Refresh Token

Verificar que al cerrar sesión:

- El Refresh Token activo quede invalidado según el mecanismo existente.
- El token no pueda volver a utilizarse para renovar la sesión.
- Se mantenga la información de revocación existente (`RevokedAt`, `IsUsed` u otros campos definidos por la implementación).
- No se almacene ni exponga el Refresh Token en texto plano.

### Cookie HttpOnly

Verificar que el logout elimine correctamente la cookie utilizada para transportar el Refresh Token.

La cookie debe conservar las mismas características de configuración utilizadas durante el login:

- Nombre configurado.
- `HttpOnly`.
- `Secure`.
- `SameSite`.
- Path, cuando corresponda.

No debe implementarse una cookie diferente para administradores.

### Refresh Token Rotation

Verificar que un Refresh Token que haya sido utilizado para renovar una sesión y posteriormente haya sido invalidado no pueda utilizarse nuevamente.

El logout debe ser compatible con el mecanismo de Refresh Token Rotation existente.

No debe existir ninguna excepción para usuarios con rol `Administrator`.

### Logout idempotente

Verificar el comportamiento cuando:

- No existe cookie de Refresh Token.
- La cookie contiene un token inválido.
- El Refresh Token ya fue utilizado.
- El Refresh Token ya fue revocado.
- El Refresh Token ya expiró.

El logout debe conservar el comportamiento idempotente definido para el sistema y no debe producir errores innecesarios en estos casos.

### Seguridad

Verificar que el logout:

- No exponga Refresh Tokens en respuestas JSON.
- No registre Refresh Tokens en logs.
- No registre cookies completas en logs.
- No exponga información sensible mediante mensajes de error.
- No permita reutilizar un Refresh Token previamente invalidado.
- No modifique el rol del usuario.
- No modifique otros datos de identidad del usuario.

### Usuarios administradores y usuarios comunes

Verificar que el mecanismo de logout sea común para:

- Usuarios normales.
- Usuarios `Administrator`.

No debe existir una implementación paralela como:

```text
POST /api/admin/logout
```

si el endpoint existente puede resolver correctamente el caso.

La diferencia entre ambos usuarios debe estar determinada por autorización sobre recursos administrativos, no por un mecanismo diferente de sesión.

### Compatibilidad con Dashboard

Verificar que el Dashboard pueda utilizar el logout existente sin necesidad de implementar lógica específica en Backend.

El flujo esperado es:

```text
Dashboard
    │
    ▼
Logout
    │
    ▼
Backend
    │
    ├── Invalidar Refresh Token
    │
    └── Eliminar cookie
    │
    ▼
Sesión finalizada
```

## Cambios esperados

Realizar cambios únicamente si la implementación existente no cumple alguno de los comportamientos anteriores.

No modificar el mecanismo de logout simplemente por incorporar el rol `Administrator` si el comportamiento actual ya es correcto.

Si fuera necesario modificar la implementación:

- Mantener la lógica de logout centralizada.
- Evitar duplicación entre usuarios normales y administradores.
- Reutilizar `IRefreshTokenRepository`.
- Reutilizar la configuración existente de cookies.
- Mantener el comportamiento idempotente.
- Mantener el manejo global de errores.

## Documentación

Si se realizan cambios funcionales o contractuales, actualizar únicamente la documentación correspondiente.

Como mínimo evaluar:

```text
project/endpoints.md
project/services.md
project/repositories.md
project/domain.md
```

No documentar información sensible relacionada con tokens o credenciales.

## Verificación técnica

Verificar que:

- Application compila correctamente.
- Infrastructure compila correctamente.
- Api compila correctamente.
- No se introducen warnings nuevos relacionados con la implementación.
- No se rompe el logout existente del Public Web.
- No se rompe Refresh Token Rotation.
- No se introduce un endpoint administrativo duplicado.
- No se modifica innecesariamente el mecanismo de autenticación existente.

## Resultado esperado

El logout de usuarios administradores debe funcionar utilizando exactamente el mismo mecanismo de sesión existente en Comic Library.

Un administrador debe poder cerrar sesión correctamente desde el Dashboard, provocando la invalidación de su Refresh Token y la eliminación de la cookie correspondiente.

No debe existir una implementación de logout específica para administradores.

## Resultado de la verificación

Al finalizar la tarea, reportar:

- Si fue necesario modificar código.
- Qué componentes fueron modificados, si corresponde.
- Qué endpoint de logout se utiliza.
- Cómo se invalida el Refresh Token.
- Cómo se elimina la cookie `HttpOnly`.
- Qué ocurre si el token ya estaba revocado o era inválido.
- Si se verificó la compatibilidad con Refresh Token Rotation.
- Si se verificó el comportamiento tanto para usuarios normales como para administradores.
- Si se actualizaron documentos.
- Resultado de la compilación de Application, Infrastructure y Api.
- Cualquier observación o problema detectado.

---

## Reporte de verificación (Backend Agent)

### Resultado
- **No fue necesario realizar cambios de código.** El logout ya es compatible con usuarios `Administrator`.

### Logout
- Endpoint utilizado: el de logout existente (sin `/api/admin/logout`). `AuthService.LogoutAsync` revoca el Refresh Token por su hash, rol-agnóstico.
- Revocación: el Refresh Token queda invalidado (`RevokedAt`/`IsUsed`); no reutilizable.
- Cookie `HttpOnly`: eliminada/configurada con la configuración existente (`RefreshTokenCookieSettingsProvider`); sin cookie paralela para admins.
- Idempotencia: ante token ausente, inválido, ya usado, revocado o expirado, el logout no produce errores (comportamiento actual preservado).
- Compatible con Refresh Token Rotation; el rol no requiere tratamiento especial.

### Seguridad
- No expone Refresh Tokens en JSON ni logs; no modifica el rol ni otros datos de identidad.

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings.

### Documentación
- Sin cambios necesarios.

### Observaciones
- Ninguna.