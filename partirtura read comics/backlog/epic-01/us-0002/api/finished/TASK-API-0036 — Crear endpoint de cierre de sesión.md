# TASK-API-0036 — Crear endpoint de cierre de sesión

## Objetivo

Implementar el endpoint de logout para permitir al frontend cerrar la sesión del usuario y revocar el Refresh Token.

## Contexto

El Frontend Public Web Agent necesita un endpoint de logout para implementar TASK-PUBLIC-WEB-0021.

El logout debe:
- Revocar el Refresh Token asociado a la sesión.
- Eliminar/invalidar la cookie HttpOnly que contiene el Refresh Token.
- Devolver una respuesta exitosa al frontend.

## Endpoint propuesto

```text
POST /api/users/logout
```

## Request

- Content-Type: application/json
- Body: vacío o con información mínima según la implementación.
- La cookie HttpOnly con el Refresh Token debe enviarse automáticamente por el navegador.

## Response esperada

- 200 OK
  ```json
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {}
  }
  ```

## Errores esperados

- 401 Unauthorized: si no hay sesión activa.
- 500 Internal Server Error: error interno.

## Restricciones

- El frontend no debe enviar el Refresh Token en el body ni en headers.
- El frontend no debe manipular la cookie HttpOnly.
- La invalidación de la cookie es responsabilidad exclusiva del backend.

## Criterios de aceptación

1. El endpoint existe y responde en `/api/users/logout`.
2. El método HTTP es POST.
3. La cookie HttpOnly es invalidada/eliminada por el backend.
4. El Refresh Token es revocado en el backend.
5. La respuesta exitosa indica que la sesión fue cerrada.
6. El endpoint no requiere datos sensibles en el request body.

## Generado por

Frontend Public Web Agent

## Asignado a

Backend Agent

## Bloquea

TASK-PUBLIC-WEB-0021 — Implementar Logout y finalización de sesión

---

## Resultado de la ejecución

### Cambios realizados

**Application/Interfaces/IAuthService.cs**
- Se agregó el método `Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)`.

**Application/Services/AuthService.cs**
- Se implementó `LogoutAsync`:
  - Hashea el raw token recibido.
  - Busca el `RefreshToken` por hash.
  - Si no existe, retorna sin error (idempotente).
  - Si existe pero ya está revocado, usado o expirado, retorna sin error.
  - Si existe y está activo, marca `RevokedAt = DateTime.UtcNow` e `IsUsed = true`.
  - Persiste los cambios mediante `UpdateAsync` y `SaveChangesAsync`.

**Api/Controllers/UsersController.cs**
- Se agregó el endpoint `POST /api/users/logout`:
  - Lee la cookie `comic_library_refresh_token` del request.
  - Si la cookie existe, llama a `_authService.LogoutAsync`.
  - Elimina la cookie del response con `Response.Cookies.Delete`.
  - Retorna `ApiResponse<object>(true, "OK", 200, null)`.
  - No requiere body ni headers sensibles.

**project/endpoints.md**
- Se agregó la documentación del endpoint `POST /api/users/logout` con request, response, errores y notas.

**project/services.md**
- Se actualizó `AuthService` para incluir el comportamiento de `LogoutAsync`.

### Verificación

- `Api` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- El endpoint no requiere datos sensibles en el request body.
- La cookie HttpOnly es eliminada por el backend.
- El Refresh Token es revocado en el backend.
- La operación es idempotente: si no hay sesión activa, retorna 200 OK de todas formas.
