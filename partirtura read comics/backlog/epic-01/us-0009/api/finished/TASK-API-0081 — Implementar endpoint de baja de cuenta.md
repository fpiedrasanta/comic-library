# TASK-API-0081 — Implementar endpoint de baja de cuenta

## Objetivo

Exponer mediante la API el flujo de solicitud, validación y confirmación de baja de la cuenta.

## Alcance

Definir los endpoints necesarios reutilizando los existentes cuando corresponda.

El contrato debe contemplar como mínimo:

- Solicitar código de confirmación de baja.
- Confirmar la baja mediante el código recibido.

Los endpoints deben:

- Requerir autenticación.
- Obtener el usuario desde el contexto de autenticación.
- No aceptar un `userId` ni un email para identificar la cuenta.
- Validar los datos recibidos mediante DTOs.
- Utilizar el servicio de aplicación correspondiente.
- Mantener el manejo centralizado de errores.
- Documentar los nuevos contratos en `project/endpoints.md`.

## Criterios de aceptación

- [ ] Existe un endpoint para solicitar el código de baja.
- [ ] Existe un endpoint para confirmar la baja.
- [ ] Ambos utilizan la identidad del usuario autenticado.
- [ ] No es posible indicar desde el request qué usuario se desea eliminar.
- [ ] La API devuelve respuestas consistentes con los contratos existentes.
- [ ] Los endpoints quedan documentados.

## Resultado de la ejecución

### Trabajo realizado

1. Se agregaron dos endpoints en `UsersController`:
   - `POST /api/users/account-deletion/request`
   - `POST /api/users/account-deletion/confirm`
2. Ambos endpoints requieren autenticación (`[Authorize]`).
3. El usuario se determina exclusivamente desde el claim `sub` del JWT.
4. No se acepta `userId` ni `email` en el cuerpo de la solicitud.
5. Se utilizan DTOs específicos (`ConfirmAccountDeletionApiRequest`).
6. Se integró `IAccountDeletionService` en el controller.
7. Se actualizó `project/endpoints.md` con los contratos de ambos endpoints.

### Cambios específicos

- `Api/Controllers/UsersController.cs`: se agregaron `RequestAccountDeletion` y `ConfirmAccountDeletion`.
- `project/endpoints.md`: se documentaron `POST /api/users/account-deletion/request` y `POST /api/users/account-deletion/confirm`.

### Criterios de aceptación cumplidos

- [x] Existe un endpoint para solicitar el código de baja.
- [x] Existe un endpoint para confirmar la baja.
- [x] Ambos utilizan la identidad del usuario autenticado.
- [x] No es posible indicar desde el request qué usuario se desea eliminar.
- [x] La API devuelve respuestas consistentes con los contratos existentes.
- [x] Los endpoints quedan documentados.

### Notas

- Las respuestas utilizan el wrapper estándar `ApiResponse<T>`.
- Los errores de autenticación devuelven el mensaje genérico definido en las reglas del proyecto.
- El endpoint de confirmación valida que el código tenga exactamente 6 dígitos mediante `RegularExpression` en el DTO.
