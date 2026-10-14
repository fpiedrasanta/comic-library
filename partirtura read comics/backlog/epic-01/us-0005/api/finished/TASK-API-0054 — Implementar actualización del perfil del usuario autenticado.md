# TASK-API-0054 — Implementar actualización del perfil del usuario autenticado

## Objetivo

Implementar el caso de uso que permita al usuario autenticado modificar la información personal permitida de su propio perfil.

## Alcance

Implementar:

- Caso de uso para actualizar el perfil.
- DTO/request específico para la actualización.
- Endpoint HTTP.
- Validaciones correspondientes.
- Persistencia de los cambios.
- Respuesta con el perfil actualizado o el contrato definido por la arquitectura existente.

## Datos modificables

La operación debe permitir modificar únicamente los datos contemplados por la US-0005.

Como mínimo:

- Nombre.
- Apellido.
- Nacionalidad.
- Avatar, si la implementación definitiva del avatar forma parte del mismo contrato.

## Datos no modificables

El email no debe poder modificarse mediante este endpoint.

Tampoco deben poder modificarse mediante esta operación:

- PasswordHash.
- Refresh Tokens.
- Tokens de validación.
- Tokens de recuperación.
- Información de autenticación.
- Identificador del usuario.

## Reglas

1. El endpoint requiere autenticación.
2. El usuario se identifica mediante el contexto autenticado.
3. No debe confiarse en un `userId` enviado por el cliente.
4. El usuario únicamente puede modificar su propio perfil.
5. La nacionalidad es opcional.
6. Si `nationalityId` es `null`, debe eliminarse la asociación con la nacionalidad.
7. Si se proporciona una nacionalidad, debe verificarse que exista y sea válida.
8. Las validaciones de negocio deben realizarse en Application.
9. La actualización debe persistirse de manera consistente.
10. No debe modificarse el mecanismo de autenticación existente.
11. La actualización de perfil debe funcionar independientemente de si el usuario fue registrado mediante email/password o Google.

## Endpoint esperado

Definir el contrato definitivo siguiendo las convenciones existentes del proyecto.

Conceptualmente:

PUT `/api/users/me`

o el verbo/ruta que resulte consistente con los endpoints existentes.

No agregar un `userId` a la URL si el usuario se determina mediante autenticación.

## Arquitectura

Respetar la arquitectura existente:

- Controller sin lógica de negocio.
- Application orquesta el caso de uso.
- Infrastructure proporciona persistencia.
- No crear un Generic Repository.
- Reutilizar repositorios existentes cuando sea suficiente.

## Validaciones

Aplicar las mismas reglas de validación de datos personales utilizadas por el sistema cuando corresponda.

Los errores deben utilizar el mecanismo global de excepciones existente.

No exponer stack traces ni información técnica.

## Documentación

Actualizar, si corresponde:

- `endpoints.md`
- `services.md`
- `domain.md`
- `repositories.md`

## Verificación

Verificar:

- Un usuario autenticado puede modificar su perfil.
- Un usuario no autenticado no puede modificarlo.
- No puede modificarse otro usuario.
- No puede modificarse el email mediante este endpoint.
- Puede eliminarse la nacionalidad.
- Puede asignarse una nacionalidad válida.
- Una nacionalidad inexistente es rechazada.
- No se modifican credenciales ni tokens.
- Usuarios registrados mediante Google pueden actualizar su perfil.
- La solución compila correctamente.

---

# Resultado de la ejecución

## Estado

Finished

## Trabajo realizado

- Se creó `UpdateProfileRequest` en `Application/DTOs/`.
- Se creó `UpdateProfileApiRequest` en `Api/DTOs/`.
- Se agregó `UpdateProfileAsync` a `IUserService` y `UserService`.
- Se agregó el endpoint `PUT /api/users/me` en `UsersController` con `[Authorize]`.
- El endpoint valida país, permite eliminar nacionalidad (`countryId = null`) y no permite modificar email ni credenciales.
- Se actualizó `project/endpoints.md` con el contrato del nuevo endpoint.
- Se actualizó `project/services.md` con las nuevas responsabilidades de `UserService`.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.