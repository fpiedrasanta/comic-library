# TASK-API-0075 — Exponer el rol del usuario en UserProfileResponse

## Objetivo

Modificar el contrato de perfil del usuario para que `GET /api/users/me` exponga también el rol del usuario autenticado.

El objetivo es permitir que el Dashboard pueda reconstruir correctamente el estado de autenticación y autorización después de una recarga de página o cuando el frontend vuelva a consultar el perfil del usuario.

## Alcance

Modificar:

- `Application/DTOs/UserProfileResponse.cs`
- `Application/Services/UserService.cs`

## Implementación

Agregar `Role` a `UserProfileResponse`.

El valor debe obtenerse exclusivamente desde `User.Role` y exponerse mediante `User.Role.ToString()`.

Actualizar todas las construcciones de `UserProfileResponse` realizadas por `UserService`, incluyendo:

- `GetProfileAsync`
- `UpdateProfileAsync`
- `DeleteAvatarAsync`

No crear una segunda fuente de información para el rol.

## Compatibilidad

El valor retornado debe utilizar los valores definidos actualmente por `UserRole`:

- `PublicUser`
- `Administrator`

No modificar el modelo de roles existente.

No modificar el comportamiento del login.

No modificar la generación del JWT.

No modificar Refresh Token ni su rotación.

## Seguridad

- El rol debe provenir exclusivamente de la entidad `User` autenticada.
- No aceptar `Role` desde el request del cliente.
- No permitir modificar el rol mediante los endpoints existentes de perfil.
- No exponer información adicional de seguridad junto con el nuevo campo.

## Contrato esperado

`GET /api/users/me` debe retornar, además de los datos actuales:

- `role`: `"PublicUser"` o `"Administrator"`

El mismo comportamiento debe mantenerse después de actualizar el perfil o eliminar el avatar.

## Documentación

Actualizar la documentación correspondiente al contrato de `UserProfileResponse` si actualmente documenta explícitamente sus propiedades.

Revisar:

- `project/endpoints.md`
- `project/services.md`

Modificar únicamente lo necesario.

## Verificación técnica

- Application compila.
- Infrastructure compila.
- Api compila.
- No existen errores.
- No existen warnings nuevos.
- Las tres operaciones que retornan `UserProfileResponse` incluyen correctamente `role`.

## Resultado esperado

El frontend puede consultar `GET /api/users/me` después de una recarga o durante la reconstrucción de la sesión y obtener nuevamente el rol real del usuario autenticado.

## Problemas encontrados

Registrar cualquier inconsistencia encontrada entre el contrato documentado y la implementación real.

---

## Reporte de implementación (Backend Agent)

### Cambios
- `Application/DTOs/UserProfileResponse.cs`: agregada propiedad `string Role` al record.
- `Application/Services/UserService.cs`: las dos construcciones de `UserProfileResponse` (`GetProfileAsync`, `UpdateProfileAsync`; `DeleteAvatarAsync` delega a `GetProfileAsync`) ahora incluyen `user.Role.ToString()`. El valor proviene exclusivamente de `User.Role` (identidad persistida).
- `project/endpoints.md`: documentado `role` en las respuestas de `GET` y `PUT /api/users/me`.

### Contrato
- `GET /api/users/me`, `PUT /api/users/me` y `DELETE /api/users/me/avatar` (que retorna el perfil) ahora exponen `role: "PublicUser" | "Administrator"`.

### Seguridad
- El rol no se acepta desde el request; no se puede modificar el rol vía endpoints de perfil. No se expone información adicional.

### Compilación
- `dotnet build ComicLibrary.sln`: 0 warnings, 0 errores (Application/Infrastructure/Api).

### Observaciones
- No se modificó login, JWT, refresh token ni su rotación.