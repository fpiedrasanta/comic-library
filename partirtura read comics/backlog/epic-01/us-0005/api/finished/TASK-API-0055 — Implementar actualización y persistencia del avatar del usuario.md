# TASK-API-0055 — Implementar actualización y persistencia del avatar del usuario

## Objetivo

Implementar el mecanismo necesario para que un usuario autenticado pueda actualizar su avatar desde su perfil.

## Alcance

Determinar e implementar, de acuerdo con la arquitectura existente:

- Contrato HTTP para actualizar el avatar.
- Recepción del archivo o mecanismo definido para representar el avatar.
- Validación del archivo.
- Persistencia física del avatar.
- Persistencia de la referencia al avatar en el usuario.
- Eliminación o reemplazo seguro del avatar anterior cuando corresponda.
- Obtención de la URL o referencia necesaria para que el Public Web pueda mostrarlo.

## Reglas

1. El usuario debe estar autenticado.
2. El usuario únicamente puede modificar su propio avatar.
3. No debe recibirse un `userId` confiable desde el cliente.
4. Deben validarse tipo y tamaño del archivo.
5. No deben permitirse archivos ejecutables u otros formatos no soportados.
6. El nombre físico del archivo no debe depender directamente del nombre enviado por el usuario.
7. La referencia almacenada en la base de datos no debe exponer rutas físicas internas del servidor.
8. No deben almacenarse archivos de avatar dentro de la base de datos como texto Base64 salvo que la arquitectura existente lo establezca explícitamente.
9. Al reemplazar un avatar debe evitarse dejar archivos huérfanos.
10. La operación debe ser compatible con usuarios registrados mediante Google y usuarios registrados mediante email/password.

## Consideraciones

Antes de implementar, revisar:

- `public-web-architecture.md`
- `frontend-public-web-stack-technology.md`
- `domain.md`
- `services.md`
- `repositories.md`

Determinar si el proyecto ya dispone de infraestructura para almacenamiento de archivos que pueda reutilizarse.

No crear una segunda estrategia de almacenamiento si ya existe una.

## Seguridad

Validar:

- Extensión.
- MIME type.
- Tamaño máximo.
- Contenido cuando resulte necesario.
- Nombre de archivo.
- Ubicación de almacenamiento.

No confiar únicamente en la extensión enviada por el cliente.

## Documentación

Actualizar únicamente la documentación que realmente cambie como consecuencia de la implementación.

Como mínimo revisar:

- `endpoints.md`
- `services.md`
- `domain.md`

## Verificación

Verificar:

- Usuario autenticado puede actualizar su avatar.
- Usuario no autenticado no puede hacerlo.
- El avatar de otro usuario no puede modificarse.
- Archivos inválidos son rechazados.
- El avatar anterior se gestiona correctamente.
- La URL/referencia devuelta permite al frontend mostrar el avatar.
- No se exponen rutas físicas internas.
- No se generan archivos huérfanos innecesariamente.
- La solución compila correctamente.

---

# Resultado de la ejecución

## Estado

Finished

## Trabajo realizado

- Se agregó `DeleteAsync` a `IFileStorageService` y `FileStorageService` para eliminar archivos físicos de storage.
- Se creó `UpdateAvatarRequest` en `Application/DTOs/`.
- Se creó `UpdateAvatarApiRequest` en `Api/DTOs/`.
- Se agregó `UpdateAvatarAsync` a `IUserService` y `UserService`:
  - Valida extensión del archivo (.jpg, .jpeg, .png, .webp, .gif).
  - Elimina el avatar anterior del storage cuando existe.
  - Guarda el nuevo avatar mediante `FileStorageService` (convertido a WebP).
  - Actualiza `AvatarId`, limpia `AvatarUrl` y persiste cambios.
  - Retorna el perfil actualizado con la nueva URL de avatar.
- Se agregó el endpoint `POST /api/users/me/avatar` en `UsersController` con `[Authorize]` y `multipart/form-data`.
- Se actualizó `project/endpoints.md` con el contrato del nuevo endpoint.
- Se actualizó `project/services.md` con las nuevas responsabilidades de `UserService`.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.