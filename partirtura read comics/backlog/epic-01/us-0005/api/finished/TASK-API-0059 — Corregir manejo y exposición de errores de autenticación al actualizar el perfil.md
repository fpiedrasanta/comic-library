# TASK-API-0059 — Corregir manejo y exposición de errores de autenticación al actualizar el perfil

## Task ID

TASK-API-0059

## Tipo

Bug / Security / Error Handling

## Estado

planned

## Asignado a

Backend Agent

---

## Contexto

Durante la actualización del perfil del usuario autenticado, el frontend recibe una respuesta del backend similar a:

```json
{
  "success": false,
  "message": "Invalid token"
}
```

El frontend actualmente muestra el valor de `message` al usuario.

Esto no es correcto.

El mensaje `"Invalid token"` es un mensaje **técnico**, útil para diagnóstico del desarrollador, pero no es apropiado para mostrarlo al usuario final.

Además, el comportamiento requiere investigar por qué el backend está rechazando el token de una sesión que aparentemente se encuentra autenticada.

---

## Problemas a resolver

### 1. El backend está exponiendo un mensaje técnico al usuario

Actualmente, ante un error de autenticación/autorización relacionado con el token, el backend puede devolver:

```json
{
  "success": false,
  "message": "Invalid token"
}
```

Esto debe corregirse.

El frontend debe recibir como `message` un mensaje genérico y amigable:

```text
Se generó un error durante el proceso de autenticación.
```

El usuario **no debe recibir** mensajes como:

* `Invalid token`
* `JWT validation failed`
* `Token expired`
* `Signature validation failed`
* `SecurityToken...`
* excepciones internas
* stack traces
* nombres de clases o componentes internos

### 2. Investigar por qué se rechaza el token

No asumir que el problema es solamente de presentación.

Se debe determinar **por qué una operación realizada por un usuario que acaba de autenticarse puede terminar en un error de token**.

La investigación debe contemplar, como mínimo:

* Validación del JWT.
* Expiración del access token.
* Firma del token.
* Issuer.
* Audience.
* Claims requeridos.
* Configuración utilizada para validar el token.
* Diferencias entre el token utilizado durante login y el token utilizado posteriormente para `PUT /api/users/me`.
* Middleware de autenticación/autorización.
* Posible interacción con refresh token.
* Posible reutilización de un access token expirado.
* Cualquier diferencia entre los mecanismos utilizados para autenticar y para acceder a endpoints protegidos.

**No limitarse a cambiar el texto de `"Invalid token"` sin investigar la causa del rechazo.**

---

## Comportamiento esperado

### Para el desarrollador

Cuando el backend rechace un token, debe quedar registrado mediante el mecanismo de logging existente.

El log debe contener información suficiente para diagnosticar la causa real del rechazo, por ejemplo:

* endpoint involucrado;
* motivo de validación fallida;
* tipo de error de validación;
* información relevante sobre expiración, issuer, audience, etc., cuando corresponda.

**Nunca registrar el JWT completo, refresh token, secretos ni credenciales.**

Ejemplo conceptual:

```text
Authentication failed for PUT /api/users/me.
Reason: access token expired.
```

El mensaje exacto debe depender de la causa real encontrada.

### Para el frontend / usuario

El contrato público de error debe ocultar el detalle técnico.

Ante un error de autenticación, el backend debe responder utilizando:

```json
{
  "success": false,
  "message": "Se generó un error durante el proceso de autenticación."
}
```

Si el contrato existente contempla `details`, puede utilizarse para información adicional necesaria para el frontend, pero:

* no debe contener el JWT;
* no debe contener secretos;
* no debe contener stack traces;
* no debe exponer excepciones internas;
* no debe utilizarse para enviar mensajes técnicos destinados al usuario.

El detalle técnico debe permanecer en los logs del backend.

---

## Alcance

### Backend

Modificar el manejo de errores de autenticación para separar correctamente:

**Error técnico interno**

→ Logging para desarrolladores.

**Mensaje público**

→ Mensaje amigable y seguro para el usuario.

Además, identificar y corregir, si corresponde, la causa por la cual el token válido de una sesión autenticada está siendo rechazado durante la actualización del perfil.

### Frontend

**Fuera de alcance.**

No modificar `login-page.tsx`, `profile-page.tsx`, `use-auth.tsx` ni el mecanismo de presentación de errores.

El frontend actualmente muestra el `message` recibido del backend y, una vez corregido el contrato del backend, deberá recibir el mensaje amigable.

---

## Criterios de aceptación

1. Ante un error de validación/autenticación del token, el backend **no devuelve `"Invalid token"` al usuario**.

2. El backend devuelve como `message`:

```text
Se generó un error durante el proceso de autenticación.
```

3. El detalle técnico del error queda registrado mediante el sistema de logging existente.

4. Los logs **no contienen access tokens completos, refresh tokens, secretos ni credenciales**.

5. Si existe información adicional necesaria para el frontend, se utiliza `details` sin exponer información sensible ni excepciones internas.

6. Se identifica la causa concreta por la cual el token está siendo rechazado al intentar actualizar el perfil.

7. Si existe un problema real en la validación/configuración del token, debe corregirse y no simplemente ocultarse mediante el nuevo mensaje.

8. El endpoint de actualización de perfil continúa funcionando correctamente con una sesión autenticada válida.

9. Las respuestas de errores de autenticación mantienen el contrato existente de la API.

10. No se modifica el mecanismo de autenticación del frontend.

11. No se agregan mecanismos paralelos de autenticación.

12. La solución mantiene el manejo centralizado de errores existente.

13. La compilación del backend finaliza correctamente.

14. Se prueban al menos estos escenarios:

* token válido;
* token expirado;
* token inválido;
* ausencia de token;
* actualización de perfil con sesión autenticada válida.

---

## Restricciones

* No modificar el frontend para ocultar `"Invalid token"`.
* No hardcodear una solución específica solamente para `PUT /api/users/me` si el problema pertenece al manejo general de errores de autenticación.
* No eliminar los logs técnicos para evitar que aparezca el error.
* No devolver excepciones internas al cliente.
* No registrar tokens completos.
* Mantener el contrato de respuesta existente.
* Utilizar la infraestructura de logging y manejo de errores ya existente en el backend.

---

## Resultado esperado

Cuando el usuario intente guardar su perfil con una sesión correctamente autenticada:

**Caso exitoso:**

```text
Perfil actualizado correctamente.
```

**Caso de autenticación fallida:**

El usuario recibe:

```text
Se generó un error durante el proceso de autenticación.
```

Mientras que el desarrollador puede encontrar en los logs la causa real, por ejemplo:

```text
Authentication failed for PUT /api/users/me.
Reason: access token expired.
```

La información técnica queda separada de la información presentada al usuario.

---

# Resultado de la ejecución

## Estado

Finished

## Causa raíz identificada

El JWT Bearer de ASP.NET Core tiene `MapInboundClaims = true` por defecto, lo que remapea el claim `sub` (del JWT) a `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`.

El controller busca el claim mediante `JwtRegisteredClaimNames.Sub` (valor `"sub"`). Como el claim fue remapeado, `User.FindFirst("sub")` devuelve `null`, y el controller lanza `InvalidCredentialsException("Invalid token.")` incluso con un token JWT válido.

Esto afecta a todos los endpoints protegidos (`GET /api/users/me`, `PUT /api/users/me`, `POST /api/users/me/avatar`, `GET /api/images/{id}`), no solo al update de perfil.

## Trabajo realizado

- Se estableció `options.MapInboundClaims = false` en la configuración de JWT Bearer en `Program.cs`. Preserva los claim types originales del JWT (`sub`, `email`, etc.), permitiendo que `User.FindFirst(JwtRegisteredClaimNames.Sub)` funcione correctamente.
- Se agregaron eventos `JwtBearerEvents`:
  - `OnAuthenticationFailed`: registra el motivo técnico del rechazo (endpoint, excepción) mediante `ILogger`. Nunca registra el token completo ni secretos.
  - `OnChallenge`: devuelve HTTP 401 con el formato de error existente y el mensaje amigable: "Se generó un error durante el proceso de autenticación."
- Se modificó el mensaje de `InvalidCredentialsException` en `UsersController` de `"Invalid token."` a `"Se generó un error durante el proceso de autenticación."` en los tres endpoints protegidos (`GetProfile`, `UpdateProfile`, `UpdateAvatar`).
- Se actualizó `project/endpoints.md` con el nuevo mensaje de error en las respuestas 401 de todos los endpoints afectados.
- Se actualizó `project/services.md` con la documentación de la configuración JWT y los eventos.
- Se agregó regla #52 "Mensajes de error seguros" a `project/backend-coding-rules.md`.

## Investigación complementaria

- La validación del JWT (issuer, audience, firma, expiración) está correctamente configurada en `Program.cs`.
- No hay diferencias entre el token generado durante login y el utilizado para acceder a endpoints protegidos.
- La causa del rechazo era exclusivamente el remapeo de claims (`MapInboundClaims = true`).
- El access token dura 60 minutos (`Jwt:ExpirationMinutes`). Los tokens expirados son rechazados por validación de tiempo de vida, y `OnChallenge` devuelve el mensaje amigable mientras `OnAuthenticationFailed` registra el motivo técnico.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.
- `MapInboundClaims = false` corrige la resolución de claims para tokens válidos.
- El mensaje expuesto al usuario es: "Se generó un error durante el proceso de autenticación."
- El motivo técnico se registra en logs mediante `ILogger`.
- No se registran tokens completos, secretos ni credenciales en logs.
