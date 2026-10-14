
# TASK-API-0048 — Crear endpoint de Login mediante Google

## Objetivo

Exponer mediante la API el caso de uso de autenticación mediante Google implementado en Application.

El endpoint debe respetar los contratos y mecanismos HTTP existentes.

---

## Endpoint

Crear un endpoint específico para Google Login.

La ruta definitiva debe respetar las convenciones existentes de:

```text
/api/users/...
```

Se recomienda:

```text
POST /api/users/google-login
```

---

## Request

El endpoint debe recibir únicamente la información necesaria para iniciar la autenticación Google.

No debe recibir:

- email como identidad confiable;
- password;
- UserId;
- datos de usuario modificables.

El email y los datos del usuario deben obtenerse de la identidad Google validada.

---

## Flujo

```text
Frontend
    ↓
POST /api/users/google-login
    ↓
UsersController
    ↓
AuthService
    ↓
Google Authentication Service
    ↓
Buscar / Crear User
    ↓
Generar JWT + Refresh Token
    ↓
AuthResult
    ↓
Controller establece cookie HttpOnly
    ↓
ApiResponse<AuthResponse>
```

---

## Refresh Token

El Refresh Token:

- No debe aparecer en el JSON.
- No debe aparecer en el request.
- Debe establecerse mediante la cookie HttpOnly existente.

Debe utilizarse exactamente la misma configuración existente para:

```text
Cookies:RefreshToken
```

y:

```text
RefreshToken:ExpirationDays
```

---

## Access Token

El Access Token debe formar parte de:

```text
AuthResponse
```

Debe utilizar el `IJwtTokenGenerator` existente.

No crear un JWT específico para Google.

---

## CORS

No modificar las reglas CORS existentes salvo que sea estrictamente necesario.

El endpoint debe funcionar con la política actual que permite credentials para los orígenes autorizados.

---

## Controller

El Controller:

- recibe el request;
- delega en Application;
- establece la cookie;
- devuelve `ApiResponse<AuthResponse>`.

No debe contener:

- búsqueda de usuarios;
- creación de usuarios;
- validación de Google;
- generación de JWT;
- generación de Refresh Tokens;
- reglas de negocio.

---

## Manejo de errores

Para una autenticación Google inválida se debe devolver un error seguro y consistente.

No exponer:

- información del usuario;
- email;
- claims de Google;
- tokens;
- excepciones internas;
- información del proveedor.

---

## Documentación

Actualizar:

```text
project/endpoints.md
```

Documentar:

- Endpoint.
- Request.
- Response.
- Cookie.
- Errores.
- Seguridad.

Si se modifica otro documento, hacerlo únicamente si corresponde al cambio real.

---

## Criterios de finalización

1. Existe un endpoint para Google Login.
2. El endpoint utiliza `AuthService`.
3. El Controller no contiene lógica de negocio.
4. El endpoint devuelve `ApiResponse<AuthResponse>`.
5. El Access Token forma parte de `AuthResponse`.
6. El Refresh Token no forma parte de la respuesta JSON.
7. El Refresh Token se establece mediante cookie HttpOnly.
8. Se utiliza la configuración existente de cookies.
9. No se crea un mecanismo de sesión paralelo.
10. Los errores no revelan información sensible.
11. `endpoints.md` refleja el contrato real.
12. `Application`, `Infrastructure` y `Api` compilan correctamente.

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Changes Made

- Created `Api/DTOs/GoogleLoginRequest.cs` with `IdToken` property.
- Added `POST /api/users/google-login` endpoint in `UsersController`.
- The endpoint calls `AuthService.LoginWithGoogleAsync`, sets the Refresh Token as an HttpOnly cookie using existing configuration, and returns `ApiResponse<AuthResponse>`.
- Errors are handled by the global exception handler and return 401 Unauthorized without exposing sensitive information.
- Updated `endpoints.md` with the new endpoint contract, request, response, cookie configuration, and error examples.

### Verification

- Solution builds successfully with no errors and no warnings.
- Endpoint follows the same session mechanism as traditional login.
- Refresh Token is set via HttpOnly cookie and not exposed in JSON.
- Controller contains no business logic.