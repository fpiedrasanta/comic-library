# TASK-PUBLIC-WEB-0019 — Implementar HTTP Interceptor y renovación automática

## Objetivo

Implementar un mecanismo centralizado para adjuntar el Access Token a las solicitudes autenticadas y renovar automáticamente la sesión cuando el Access Token expire.

El Refresh Token es administrado por la API mediante una cookie `HttpOnly`.

El frontend nunca debe conocer ni manipular su valor.

---

## Access Token

Para las solicitudes autenticadas, agregar:

```text
Authorization: Bearer {AccessToken}
```

utilizando el Access Token almacenado en memoria por el estado centralizado de autenticación.

No obtener el Access Token desde:

- localStorage;
- sessionStorage;
- IndexedDB;
- cookies;
- variables persistentes.

---

## Detección de expiración

Cuando una solicitud reciba:

```text
401 Unauthorized
```

debe intentarse una renovación de sesión utilizando:

```text
POST /api/users/refresh-token
```

La cookie `HttpOnly` debe enviarse automáticamente por el navegador según la configuración de credenciales definida para el cliente HTTP.

El frontend no debe construir el Refresh Token.

---

## Flujo de renovación

```text
Request
   ↓
401 Unauthorized
   ↓
POST /api/users/refresh-token
   ↓
API valida cookie
   ↓
API realiza Refresh Token Rotation
   ↓
Nuevo Access Token
   ↓
Actualizar AuthState
   ↓
Reintentar request original
```

---

## Evitar múltiples refresh simultáneos

Debe existir un único proceso de refresh en vuelo.

Si varias solicitudes reciben `401` simultáneamente:

```text
Request A ──401──┐
Request B ──401──┼──→ único refresh
Request C ──401──┘
                    ↓
              nuevo Access Token
                    ↓
             reintentar A/B/C
```

No realizar múltiples llamadas concurrentes a `/refresh-token`.

Esto es especialmente importante porque la API utiliza Refresh Token Rotation.

---

## Request original

Cuando el refresh sea exitoso:

1. actualizar el Access Token en el estado centralizado;
2. reconstruir la solicitud original con el nuevo Access Token;
3. reintentarla una sola vez.

No generar loops infinitos de:

```text
401 → refresh → 401 → refresh → ...
```

El endpoint de refresh tampoco debe provocar un nuevo intento de refresh mediante el mismo interceptor.

---

## Refresh fallido

Si el endpoint de refresh responde con error:

```text
Refresh
   ↓
Error
   ↓
limpiar sesión
   ↓
estado Unauthenticated
```

La solicitud original no debe continuar reintentándose.

La navegación al Login será gestionada por la Task correspondiente.

---

## Contexto obligatorio

Leer:

- `project.md`
- `communication.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `public-web-architecture.md`
- `endpoints.md`
- `us-0002.md`
- `TASK-PUBLIC-WEB-0017`
- `TASK-PUBLIC-WEB-0018`

---

## Restricciones

No:

- acceder al Refresh Token;
- almacenarlo;
- agregarlo manualmente a requests;
- usar localStorage para tokens;
- implementar autorización por roles;
- implementar Logout.

---

## Criterios de finalización

1. Las solicitudes autenticadas incluyen `Authorization: Bearer`.
2. El Access Token utilizado proviene del estado en memoria.
3. Un `401` puede iniciar un refresh.
4. El Refresh Token se envía exclusivamente mediante cookie HttpOnly.
5. No existen múltiples refresh concurrentes.
6. Una renovación exitosa actualiza el Access Token.
7. La solicitud original se reintenta una sola vez.
8. No existen loops infinitos de refresh.
9. Un refresh fallido limpia la sesión.
10. El endpoint de refresh no entra en el ciclo de refresh.
11. El proyecto compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Interceptor HTTP en `api-client.ts`** (`infrastructure/api/client/api-client.ts`)
   - Toda solicitud incluye `Authorization: Bearer {accessToken}` desde el storage en memoria.
   - Cuando una respuesta tiene `401 Unauthorized` y el endpoint no es `/users/refresh-token`:
     - Se ejecuta `refreshSession()` una sola vez, incluso si múltiples requests reciben 401 simultáneamente.
     - `refreshPromise` actúa como singleton para evitar refreshes concurrentes.
     - Si el refresh es exitoso, se actualiza el token en memoria y se reintenta la solicitud original una sola vez.
     - Si el refresh falla, se limpia el Access Token y se lanza un `ApiError` 401.
   - El endpoint `/users/refresh-token` no entra en ciclo de refresh.

2. **Refresh session** (`api-client.ts`)
   - `refreshSession()` consume `POST /api/users/refresh-token`.
   - En éxito: guarda el nuevo `accessToken` en memoria.
   - En fallo: limpia el Access Token.
   - El Refresh Token nunca es leído ni manipulado por JavaScript; la cookie `HttpOnly` se envía automáticamente.

### Verificación

- `tsc --noEmit` compila sin errores.
- Solicitudes autenticadas incluyen `Authorization: Bearer`.
- Un 401 dispara un único refresh en vuelo.
- Refresh exitoso actualiza el token y reintenta el request original.
- No se generan loops infinitos de refresh.
- Refresh fallido limpia la sesión local.
- El endpoint de refresh no se reintenta a sí mismo.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.
