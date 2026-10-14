# TASK-API-0041 — Implementar cambio de contraseña y revocación de sesiones

## Objetivo

Implementar el caso de uso final de recuperación de contraseña.

Una vez validado correctamente el código de recuperación, el usuario debe poder establecer una nueva contraseña.

El cambio de contraseña debe invalidar las sesiones existentes para obligar al usuario a autenticarse nuevamente con la nueva contraseña.

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

Revisar las tareas anteriores de recuperación y las implementaciones de:

- `UserRepository`;
- `PasswordHasher`;
- `RefreshTokenRepository`;
- `UnitOfWork`;
- autenticación.

---

## Cambio de contraseña

La nueva contraseña debe cumplir las reglas de seguridad existentes para contraseñas.

Como mínimo:

- mínimo 8 caracteres;
- al menos un número;
- al menos una minúscula;
- al menos una mayúscula;
- al menos un carácter especial.

No duplicar estas reglas en múltiples lugares si ya existe una validación reutilizable.

---

## Autorización

El endpoint de cambio de contraseña no debe permitir cambiar la contraseña únicamente proporcionando:

```text
email + password
```

Debe requerir la autorización temporal obtenida después de validar correctamente el código de recuperación.

La autorización debe:

- estar vigente;
- pertenecer al usuario;
- no haber sido utilizada;
- permitir únicamente el cambio de contraseña.

---

## Persistencia de contraseña

Utilizar el mecanismo existente de hashing de contraseñas.

Nunca almacenar la nueva contraseña en texto plano.

No implementar un nuevo algoritmo de hashing si ya existe un `PasswordHasher`.

---

## Revocación de sesiones

Después de cambiar correctamente la contraseña:

- revocar todos los Refresh Tokens activos del usuario;
- impedir que puedan utilizarse para renovar sesiones;
- mantener el comportamiento existente de Refresh Token Rotation.

No es necesario eliminar físicamente los registros.

El usuario deberá volver a iniciar sesión con la nueva contraseña.

---

## Atomicidad

El cambio debe ejecutarse como una única operación lógica de persistencia.

Application debe controlar:

```text
Validar autorización
        ↓
Actualizar password
        ↓
Invalidar autorización temporal
        ↓
Revocar Refresh Tokens
        ↓
UnitOfWork.SaveChangesAsync()
```

No realizar commits parciales.

No delegar este flujo a un servicio de Infrastructure.

---

## No iniciar sesión automáticamente

El cambio de contraseña no debe generar automáticamente:

- Access Token;
- Refresh Token;
- sesión autenticada.

Una vez finalizado el proceso, el usuario debe realizar Login normalmente.

---

## Arquitectura

Application debe orquestar:

- repositorio de usuarios;
- repositorio de Refresh Tokens;
- mecanismo de hashing;
- autorización temporal;
- UnitOfWork.

Los repositories deben limitarse a persistencia y consulta.

No crear un servicio de Infrastructure que llame a repositories.

---

## Documentación

Actualizar:

- `services.md`;
- `repositories.md`;
- `endpoints.md`;
- `domain.md`, si corresponde.

Si se modifica una regla general de contraseñas:

- actualizar `backend-coding-rules.md`.

---

## Criterios de finalización

1. Se puede establecer una nueva contraseña mediante autorización temporal válida.
2. La contraseña cumple las reglas existentes.
3. La contraseña nunca se almacena en texto plano.
4. La autorización temporal no puede reutilizarse.
5. La autorización expirada es rechazada.
6. Todos los Refresh Tokens activos del usuario son revocados.
7. Los Access Tokens existentes no se deben intentar revocar mediante una lógica adicional si el sistema actual no mantiene estado para ello.
8. No se genera una nueva sesión automáticamente.
9. El cambio completo se persiste mediante UnitOfWork.
10. Application controla la orquestación.
11. No existen servicios de Infrastructure que oculten repositories.
12. `Application`, `Infrastructure` y `Api` compilan.
13. La documentación está actualizada.

---

## Resultado de la ejecución

### Cambios realizados

**Validación de contraseña**
- Se creó `IPasswordValidator` en `Application/Interfaces`.
- Se creó `PasswordValidator` en `Infrastructure/Services`.
- Valida: mínimo 8 caracteres, al menos un número, una minúscula, una mayúscula y un carácter especial.

**Repositorio de Refresh Tokens**
- Se agregó `GetActiveByUserIdAsync` a `IRefreshTokenRepository` y `RefreshTokenRepository`.
- Retorna tokens activos (no revocados, no usados, no expirados) para revocarlos.

**Cambio de contraseña**
- Se agregó `ChangePasswordAsync` a `IPasswordResetService` y `PasswordResetService`.
- Flujo:
  1. Valida que el usuario exista y tenga email validado.
  2. Valida la fuerza de la nueva contraseña.
  3. Valida la autorización temporal (no expirada, no usada, pertenece al usuario).
  4. Hashea la nueva contraseña con `IPasswordHasher`.
  5. Actualiza `PasswordHash` y `UpdatedAt` del usuario.
  6. Marca la autorización temporal como `UsedAt = DateTime.UtcNow`.
  7. Obtiene todos los Refresh Tokens activos del usuario y los revoca (`RevokedAt = DateTime.UtcNow`).
  8. Persiste todo mediante `IUnitOfWork.SaveChangesAsync()`.

**Endpoint**
- Se agregó `POST /api/users/change-password` en `UsersController`.
- Request: `{ email, authorizationToken, newPassword }`.
- Response: 200 OK con mensaje de éxito.
- Errores: 400 para validación de request, 401 para autorización inválida/expirada.

**DTOs**
- Se creó `ChangePasswordRequest` en `Application/DTOs`.
- Se creó `ChangePasswordApiRequest` en `Api/DTOs`.

**Servicio de autorización temporal**
- Se agregó `HashToken` a `IPasswordResetAuthorizationService` y `PasswordResetAuthorizationService`.
- Permite buscar la autorización por hash sin exponer el token raw.

**DI**
- Se registraron en `Program.cs`:
  - `IPasswordValidator` → `PasswordValidator`

**Documentación**
- `repositories.md`: Se agregó `GetActiveByUserIdAsync` a `RefreshTokenRepository`.
- `services.md`: Se agregó `PasswordValidator`, se actualizó `PasswordResetService` y `PasswordResetAuthorizationService`.
- `endpoints.md`: Se agregó `POST /api/users/change-password`.
- `domain.md`: Sin cambios (la entidad `PasswordResetAuthorization` ya estaba documentada).

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- No se incorporaron nuevas dependencias tecnológicas.
- La contraseña nunca se almacena en texto plano.
- La autorización temporal no es un JWT y tiene expiración.
- El cambio completo se persiste mediante UnitOfWork.
- No se genera sesión automáticamente.
