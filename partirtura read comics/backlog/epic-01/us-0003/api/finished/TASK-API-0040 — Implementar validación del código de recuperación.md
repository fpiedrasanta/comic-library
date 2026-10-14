# TASK-API-0040 — Implementar validación del código de recuperación

## Objetivo

Implementar el caso de uso que permite validar el código de 6 dígitos recibido por email antes de permitir el cambio de contraseña.

La validación debe garantizar que:

- el código sea válido;
- pertenezca al proceso correcto;
- no esté expirado;
- no haya sido utilizado;
- no pueda reutilizarse.

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

Revisar las implementaciones creadas en:

- `TASK-API-0037`
- `TASK-API-0038`
- `TASK-API-0039`

---

## Código

El código recibido debe cumplir:

- exactamente 6 caracteres;
- solamente dígitos.

Ejemplo válido:

```text
126829
```

Ejemplos inválidos:

```text
12682
1268290
12AB29
```

El código recibido debe compararse contra el hash almacenado.

Nunca comparar almacenando o persistiendo el código raw.

---

## Validaciones

El código debe rechazarse si:

- no existe;
- está expirado;
- ya fue utilizado;
- no corresponde al usuario/proceso;
- no cumple el formato esperado.

No devolver información que permita deducir detalles internos del proceso.

---

## Autorización temporal

La validación del código no debería obligar al usuario a enviar nuevamente el código de 6 dígitos para cambiar la contraseña.

Al validar correctamente el código, generar un mecanismo temporal que autorice exclusivamente el cambio de contraseña.

Este mecanismo debe:

- tener expiración;
- ser de un solo uso;
- estar vinculado al usuario;
- no permitir autenticación general;
- no convertirse en un Access Token;
- no reemplazar al JWT.

El mecanismo debe almacenarse de forma segura, preferentemente mediante hash, siguiendo los mismos principios aplicados a los tokens existentes.

---

## Invalidación

Una vez utilizado correctamente el código:

- debe quedar marcado como utilizado;
- no debe poder validarse nuevamente.

El estado debe persistirse utilizando UnitOfWork.

---

## Arquitectura

El Application Service debe orquestar:

```text
Controller
    ↓
Application Service
    ├── Repository
- ├── servicio técnico de hashing/validación
- ├── generación de autorización temporal
- └── UnitOfWork
```

No crear servicios de Infrastructure que llamen repositories.

---

## Documentación

Actualizar:

- `domain.md`, si se incorpora una entidad para autorización temporal;
- `repositories.md`, si se incorpora un repository;
- `services.md`, si se incorpora un servicio técnico;
- `endpoints.md`, cuando corresponda.

---

## Criterios de finalización

1. El código debe ser exactamente de 6 dígitos.
2. Se valida contra el hash almacenado.
3. Un código expirado es rechazado.
4. Un código utilizado es rechazado.
5. Un código incorrecto es rechazado.
6. Un código válido solamente puede utilizarse una vez.
7. Se genera autorización temporal para cambiar la contraseña.
8. Esa autorización no es un JWT.
9. Tiene expiración.
10. Está vinculada al usuario.
11. No permite autenticarse.
12. No se almacena información sensible en texto plano.
13. Application controla la orquestación.
14. No existen Infrastructure Services que oculten repositories.
15. `Application` e `Infrastructure` compilan.
16. La documentación está actualizada.

---

## Resultado de la ejecución

### Cambios realizados

**Entidad de autorización temporal**
- Se creó `PasswordResetAuthorization` en `Domain/Entities` con propiedades: `Id`, `UserId`, `User`, `TokenHash`, `CreatedAt`, `ExpiresAt`, `UsedAt`.
- No almacena el token raw.

**Repositorio**
- Se creó `IPasswordResetAuthorizationRepository` en `Application/Interfaces`.
- Se creó `PasswordResetAuthorizationRepository` en `Infrastructure/Repositories`.
- Operaciones: `AddAsync`, `GetByTokenHashAsync`, `UpdateAsync`.

**Configuración EF Core**
- Se creó `PasswordResetAuthorizationConfiguration` en `Infrastructure/Persistence/Configurations`.
- Tabla `PasswordResetAuthorizations` con foreign key a `Users` e índice en `UserId`.

**Servicio técnico**
- Se creó `IPasswordResetAuthorizationService` en `Application/Interfaces`.
- Se creó `PasswordResetAuthorizationService` en `Infrastructure/Services`.
- Genera token temporal aleatorio (32 bytes, Base64Url) y su hash SHA256.
- Valida token contra hash con `FixedTimeEquals`.

**Validación del código**
- Se agregó `ValidateResetAsync` a `IPasswordResetService` y `PasswordResetService`.
- Valida que el código tenga exactamente 6 dígitos (formato), existe, pertenece al usuario, no está expirado y no fue utilizado.
- Marca el `PasswordResetToken` como `UsedAt = DateTime.UtcNow`.
- Genera una autorización temporal (`PasswordResetAuthorization`) con expiración de 15 minutos.
- Retorna el `AuthorizationToken` raw para el frontend.

**Endpoint**
- Se agregó `POST /api/users/validate-password-reset` en `UsersController`.
- Request: `{ email, code }`.
- Response: `{ authorizationToken }`.
- Errores: 400 para validación de request, 401 para código inválido/expirado.

**DI**
- Se registraron en `Program.cs`:
  - `IPasswordResetTokenRepository` → `PasswordResetTokenRepository`
  - `IPasswordResetAuthorizationRepository` → `PasswordResetAuthorizationRepository`
  - `IPasswordResetAuthorizationService` → `PasswordResetAuthorizationService`

**Migración**
- Se generó `20260818235605_AddPasswordResetAuthorization`.
- Se aplicó la migración a la base de datos.
- Se creó la tabla `PasswordResetAuthorizations` con su foreign key, índice y columna `UsedAt`.

**Documentación**
- `domain.md`: Se agregó `PasswordResetAuthorization`.
- `repositories.md`: Se agregó `PasswordResetAuthorizationRepository`.
- `services.md`: Se agregó `PasswordResetAuthorizationService`.
- `endpoints.md`: Se agregó `POST /api/users/validate-password-reset`.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- La migración fue aplicada exitosamente.
- No se incorporaron nuevas dependencias tecnológicas.
- El código raw nunca se persiste.
- La autorización temporal no es un JWT y tiene expiración de 15 minutos.
