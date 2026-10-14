# TASK-API-0042 — Crear endpoints de recuperación de contraseña y actualizar documentación

## Objetivo

Crear los endpoints de Presentation necesarios para exponer el flujo completo de recuperación de contraseña implementado en las Tasks anteriores.

Los Controllers deben limitarse a responsabilidades HTTP.

No deben contener lógica de negocio.

---

## Contexto obligatorio

Leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `epic-01.md`
- `us-0003.md`

Revisar las Tasks:

- `TASK-API-0037`
- `TASK-API-0038`
- `TASK-API-0039`
- `TASK-API-0040`
- `TASK-API-0041`

---

## Endpoints

Exponer los endpoints necesarios para completar el flujo.

Como mínimo deberá contemplarse:

### Solicitar recuperación

```text
POST /api/users/forgot-password
```

Debe recibir el email.

No debe revelar si el email existe.

---

### Reenviar código

```text
POST /api/users/resend-password-reset-code
```

Debe generar un nuevo código e invalidar el anterior.

La respuesta debe contener la información necesaria para el temporizador del frontend.

---

### Validar código

```text
POST /api/users/validate-password-reset-code
```

Debe recibir los datos necesarios para identificar el proceso y el código de 6 dígitos.

Debe devolver el mecanismo temporal que habilita el cambio de contraseña, según la implementación definida en `TASK-API-0038`.

No devolver información sensible innecesaria.

---

### Cambiar contraseña

```text
POST /api/users/reset-password
```

Debe recibir:

- autorización temporal;
- nueva contraseña;
- confirmación de contraseña si corresponde al contrato definido.

No debe recibir ni utilizar el código de 6 dígitos nuevamente si ya fue validado.

---

## DTOs

Crear DTOs específicos en:

```text
Api/DTOs
```

Los DTOs representan exclusivamente el contrato HTTP.

No exponer entidades de Domain.

No exponer DTOs internos de Application que no formen parte del contrato público.

---

## Respuestas

Mantener el formato estándar:

```text
ApiResponse<T>
```

No usar object cómo definición de T

Utilizar los códigos HTTP establecidos por las convenciones actuales del proyecto.

Los errores deben ser consistentes con el manejo global de excepciones.

---

## Seguridad

Los endpoints no deben:

- devolver códigos de recuperación;
- devolver hashes;
- revelar si un email existe;
- devolver contraseñas;
- registrar códigos en logs;
- exponer Refresh Tokens en JSON.

El Refresh Token continúa utilizando exclusivamente la cookie HttpOnly definida por la arquitectura existente.

---

## Temporizador

Los endpoints de solicitud y reenvío deben devolver la información correspondiente a la expiración real del código.

El frontend debe poder calcular cuánto tiempo queda sin necesidad de asumir un valor hardcodeado.

---

## Controller

El Controller debe:

- recibir DTO;
- validar ModelState mediante los mecanismos existentes;
- invocar Application Service;
- devolver `ApiResponse`;
- traducir el resultado a HTTP.

No debe:

- consultar repositories;
- generar códigos;
- validar hashes;
- modificar entidades;
- manejar transacciones;
- enviar emails directamente.

---

## Documentación

Actualizar `endpoints.md` con:

- endpoint;
- método HTTP;
- URL;
- request;
- response;
- códigos HTTP;
- errores;
- comportamiento de seguridad;
- información de expiración;
- flujo entre endpoints.

Verificar también que:

- `services.md`;
- `repositories.md`;
- `domain.md`;

reflejen la implementación real.

Si se incorpora una regla arquitectónica general nueva, actualizar:

```text
backend-coding-rules.md
```

No agregar configuraciones de aplicación a:

```text
backend-stack-technology.md
```

---

## Verificación final

Ejecutar build de:

- `Application`;
- `Infrastructure`;
- `Api`.

Verificar que los endpoints estén correctamente registrados.

Verificar que los contratos documentados coincidan exactamente con las implementaciones.

---

## Criterios de finalización

1. Existe endpoint para solicitar recuperación.
2. Existe endpoint para reenviar código.
3. Existe endpoint para validar código.
4. Existe endpoint para cambiar contraseña.
5. Los Controllers no contienen lógica de negocio.
6. Los DTOs representan correctamente los contratos HTTP.
7. Se utiliza `ApiResponse<T>`.
8. No se revela existencia de usuarios.
9. No se expone ningún código de recuperación.
10. El código de recuperación es de 6 dígitos.
11. El frontend recibe la información necesaria para el temporizador.
12. El cambio de contraseña requiere autorización temporal válida.
13. El cambio de contraseña revoca las sesiones mediante Refresh Tokens.
14. El Refresh Token continúa protegido mediante cookie HttpOnly.
15. `endpoints.md` coincide con la implementación.
16. La documentación relacionada está actualizada.
17. `Application` compila.
18. `Infrastructure` compila.
19. `Api` compila.
20. No se introdujeron violaciones de la arquitectura definida en `backend-coding-rules.md`.

---

## Resultado de la ejecución

### Cambios realizados

**Endpoints actualizados en UsersController**
- `POST /api/users/forgot-password`: Solicita recuperación de contraseña. Recibe email, no revela si existe. Retorna `expiresInMinutes`.
- `POST /api/users/resend-password-reset-code`: Reenvía código de recuperación. Invalida códigos anteriores. Retorna `expiresInMinutes`.
- `POST /api/users/validate-password-reset-code`: Valida código de 6 dígitos. Retorna `authorizationToken` temporal.
- `POST /api/users/reset-password`: Cambia contraseña usando autorización temporal. Revoca todas las sesiones activas.

**DTOs de request en Api/DTOs**
- `RequestPasswordResetApiRequest`: Ya existía, con validación de email.
- `ResendPasswordResetApiRequest`: Ya existía, con validación de email.
- `ValidatePasswordResetApiRequest`: Actualizado con `[RegularExpression(@"^\d{6}$")]` para validar que el código sea exactamente 6 dígitos.
- `ChangePasswordApiRequest`: Convertido a clase con `[Required]` y `[MinLength(8)]` para `NewPassword`.

**DTOs de respuesta en Api/DTOs**
- `ForgotPasswordResponse`: Contiene `ExpiresInMinutes`.
- `ResendPasswordResetCodeResponse`: Contiene `ExpiresInMinutes`.
- `ValidatePasswordResetCodeResponse`: Contiene `AuthorizationToken`.
- `ResetPasswordResponse`: Respuesta vacía para confirmación de cambio.

**Respuestas estandarizadas**
- Todos los endpoints ahora devuelven `ApiResponse<T>` con un tipo específico, sin usar `object`.
- Los mensajes de error son consistentes con el manejo global de excepciones.

**Validaciones ModelState**
- Los DTOs utilizan `DataAnnotations` (`[Required]`, `[EmailAddress]`, `[RegularExpression]`, `[MinLength]`, `[StringLength]`).
- El `[ApiController]` attribute maneja automáticamente la validación de ModelState retornando 400 Bad Request cuando corresponde.

**Documentación actualizada**
- `endpoints.md`: Se actualizaron todas las rutas de recuperación de contraseña con los nuevos paths, request/response bodies, códigos HTTP, errores, comportamiento de seguridad y notas del frontend.
- `services.md`, `repositories.md`, `domain.md`: Ya reflejaban la implementación real desde TASK-API-0041.

**Seguridad verificada**
- No se devuelven códigos de recuperación en respuestas.
- No se devuelven hashes.
- No se revela si un email existe (mensajes genéricos).
- No se devuelven contraseñas.
- El Refresh Token continúa protegido por cookie HttpOnly.
- La autorización temporal no es un JWT.

**Verificación**
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- No se introdujeron nuevas dependencias tecnológicas.
- No se introdujeron violaciones arquitectónicas.
- Los contratos documentados coinciden exactamente con las implementaciones.
