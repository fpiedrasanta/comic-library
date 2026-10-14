# TASK-API-0053 — Implementar consulta del perfil del usuario autenticado

## Objetivo

Implementar el caso de uso que permita obtener la información del perfil del usuario actualmente autenticado.

La operación debe identificar al usuario exclusivamente a partir de la identidad autenticada en el contexto HTTP y nunca recibir un `userId` desde el cliente.

## Alcance

Implementar:

- Caso de uso para obtener el perfil del usuario autenticado.
- DTO específico para la respuesta del perfil.
- Endpoint HTTP para consultar el perfil.
- Obtención del usuario mediante el identificador disponible en los claims de autenticación.
- Inclusión de la información necesaria para mostrar el perfil.
- Inclusión de la nacionalidad cuando corresponda.
- Inclusión de la información del avatar cuando corresponda.

## Reglas

1. El endpoint requiere autenticación.
2. El usuario se determina mediante el contexto de autenticación.
3. El endpoint no debe recibir `userId` como parámetro.
4. Un usuario únicamente puede consultar su propio perfil.
5. El email debe ser retornado como información de perfil, pero no debe ser modificable mediante el caso de uso de actualización.
6. La nacionalidad es opcional.
7. Si el usuario no tiene nacionalidad, la respuesta debe representar correctamente el valor `null`.
8. No deben retornarse datos sensibles como `PasswordHash`, Refresh Tokens, tokens de validación, tokens de recuperación o información interna de autenticación.
9. El DTO de respuesta debe contener únicamente información necesaria para el Public Web.

## Endpoint esperado

Definir el contrato definitivo siguiendo las convenciones existentes del proyecto y documentarlo en `endpoints.md`.

La operación debe ser equivalente conceptualmente a:

GET `/api/users/me`

## DTO

Definir un DTO específico para el perfil.

Como mínimo debe contemplar:

- Id del usuario, si resulta necesario para el frontend.
- Nombre.
- Apellido.
- Email.
- Avatar.
- Nacionalidad.
- Cualquier otro dato de perfil que ya forme parte del dominio y sea necesario para esta pantalla.

No reutilizar DTOs internos de persistencia.

## Arquitectura

Respetar la separación existente:

- Presentation: HTTP, autenticación y respuesta.
- Application: caso de uso y reglas de negocio.
- Infrastructure: acceso a datos mediante los repositorios existentes.

No introducir lógica de negocio en el Controller.

No crear un repositorio genérico únicamente para resolver esta funcionalidad.

## Documentación

Actualizar, si corresponde:

- `endpoints.md`
- `services.md`
- `domain.md`
- `repositories.md`

No modificar documentación que no resulte afectada.

## Verificación

Verificar:

- Usuario autenticado puede consultar su perfil.
- Usuario no autenticado recibe la respuesta correspondiente.
- No es posible consultar el perfil de otro usuario enviando un `userId`.
- Nacionalidad `null` funciona correctamente.
- No se exponen datos sensibles.
- Application, Infrastructure y Api compilan correctamente.

---

# Resultado de la ejecución

## Estado

Finished

## Trabajo realizado

- Se creó el DTO `UserProfileResponse` en `Application/DTOs/`.
- Se agregó `GetProfileAsync` a `IUserService` y `UserService`.
- Se agregó `Include(u => u.Nationality)` y `Include(u => u.Avatar)` en `UserRepository.GetByIdAsync`.
- Se configuró JWT Bearer Authentication en `Program.cs` (`AddAuthentication`, `AddJwtBearer`, `UseAuthentication`, `UseAuthorization`).
- Se expuso el endpoint `GET /api/users/me` en `UsersController` con `[Authorize]`.
- El usuario se determina desde el claim `sub` del JWT.
- La respuesta incluye avatar resuelto (Image > AvatarUrl > null) y nacionalidad opcional.
- Se actualizó `project/endpoints.md`.
- Se actualizó `project/services.md`.
- Se generó la migración EF Core `AddAvatarUrlToUser` (no aplicada).

## Verificación

- Build exitoso: 0 errores, 0 advertencias.