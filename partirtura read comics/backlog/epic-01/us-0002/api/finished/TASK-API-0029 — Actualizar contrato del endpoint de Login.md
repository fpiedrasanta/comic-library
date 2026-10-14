# TASK-API-0029 — Actualizar contrato del endpoint de Login

## Objetivo

Verificar y corregir la documentación del endpoint:

```text
POST /api/users/login
```

en:

```text
endpoints.md
```

La documentación debe reflejar exactamente el contrato implementado actualmente por la API.

## Alcance

Revisar la entrada correspondiente a:

```text
POST /api/users/login
```

y verificar que la respuesta exitosa esté documentada utilizando:

```text
ApiResponse<AuthResponse>
```

y no:

```text
ApiResponse<object>
```

El DTO de respuesta de autenticación es:

```text
AuthResponse
```

y contiene únicamente las propiedades que estén presentes en la implementación actual.

## Reglas

- No modificar el Controller.
- No modificar `AuthService`.
- No modificar `AuthResponse`.
- No modificar el comportamiento del endpoint.
- No agregar propiedades que no existan en el DTO real.
- No modificar otros endpoints.
- La documentación debe representar el contrato real de la API.

## Errores

Verificar además que la documentación mantenga correctamente los errores definidos para el Login.

En particular, debe quedar claro que el backend no revela si:

- el usuario no existe;
- el usuario existe pero su email no fue validado;
- la contraseña es incorrecta.

Estos casos deben utilizar el comportamiento de error genérico definido para autenticación.

## Contexto obligatorio

Antes de ejecutar la Task, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `endpoints.md`
- La Epic correspondiente: `epic-01.md`
- La User Story correspondiente: `us-0002.md`
- La implementación actual de `LoginRequest`.
- La implementación actual de `AuthResponse`.
- `UsersController`.
- `IAuthService`.
- `AuthService`.

## Criterios de finalización

La Task se considera finalizada cuando:

1. `endpoints.md` contiene la documentación de `POST /api/users/login`.
2. El request documentado coincide con `LoginRequest`.
3. La respuesta exitosa documentada corresponde a `ApiResponse<AuthResponse>`.
4. Las propiedades documentadas de `AuthResponse` coinciden con la implementación real.
5. Los errores documentados coinciden con el comportamiento actual de la API.
6. No se modificó código de la API.
7. No se modificaron otros endpoints.

---

## Resultado de la ejecución

### Cambios realizados

**`project/endpoints.md`**
- Se actualizó la documentación de `POST /api/users/login` para reflejar el tipo de respuesta real `ApiResponse<AuthResponse>`.
- Se agregó la sección `Response Type` debajo del cuerpo de respuesta exitosa para dejar explícito el tipo genérico.
- Se verificó que el request documentado coincide con `LoginRequest` (`email` y `password` en formato JSON).
- Se verificó que las propiedades documentadas del payload coinciden exactamente con `AuthResponse`:
  - `accessToken`
  - `refreshToken`
  - `userId`
  - `email`
  - `fullName`
  - `role`
- Se verificó que los errores documentados coinciden con el comportamiento actual:
  - `400 Bad Request` para validaciones de request.
  - `401 Unauthorized` para credenciales inválidas, email no validado o email inexistente (sin revelar cuál es el caso).
- No se modificó ningún código de la API.

### Verificación

- `endpoints.md` actualizado correctamente.
- No se modificó el Controller, `AuthService`, `AuthResponse` ni ningún otro endpoint.
- La documentación refleja el contrato real implementado.
