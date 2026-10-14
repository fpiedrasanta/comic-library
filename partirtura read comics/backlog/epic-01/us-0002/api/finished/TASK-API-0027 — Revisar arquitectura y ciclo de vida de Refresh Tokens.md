# TASK-API-0027 — Revisar arquitectura y ciclo de vida de Refresh Tokens

## Objetivo

Revisar la implementación realizada para la gestión de Refresh Tokens y corregir cualquier decisión que no sea consistente con la arquitectura o las reglas definidas para Comic Library.

La Task debe revisar específicamente:

- La existencia de `GetActiveTokenAsync`.
- La ubicación y responsabilidades de `RefreshTokenService`.
- La atomicidad de `Refresh Token Rotation`.
- El manejo de fechas en UTC.

No se debe modificar el comportamiento funcional más allá de lo necesario para corregir estos puntos.

## 1. Revisar GetActiveTokenAsync

Revisar la existencia de:

```text
GetActiveTokenAsync
```

Actualmente el servicio expone una operación para obtener el Refresh Token activo de un usuario.

No existe actualmente un requerimiento que establezca que un usuario solamente puede tener un Refresh Token activo.

Un usuario podría tener múltiples sesiones simultáneas, por ejemplo:

```text
Usuario
├── Refresh Token - PC
├── Refresh Token - Celular
└── Refresh Token - Tablet
```

Por lo tanto:

- No asumir que existe un único Refresh Token activo por usuario.
- Si `GetActiveTokenAsync` no es utilizado por ningún caso de uso actual y no existe una necesidad funcional para mantenerlo, eliminarlo.
- No implementar una restricción de un único Refresh Token activo por usuario.
- Mantener la posibilidad de que un usuario tenga múltiples Refresh Tokens activos.

La decisión final debe quedar justificada en la Task.

## 2. Revisar ubicación y responsabilidades de RefreshTokenService

Revisar la implementación actual de:

```text
Infrastructure/Services/RefreshTokenService.cs
```

y determinar si sus responsabilidades están correctamente ubicadas según la arquitectura definida:

```text
Presentation
    ↓
Application
    ↓
Infrastructure
    ↓
Domain
```

La revisión debe diferenciar entre:

### Responsabilidades de aplicación

Por ejemplo:

- Validar que un Refresh Token pueda utilizarse.
- Determinar si está expirado.
- Determinar si fue revocado.
- Determinar si ya fue utilizado.
- Coordinar Refresh Token Rotation.

### Responsabilidades de infraestructura

Por ejemplo:

- Generación criptográficamente segura de valores aleatorios.
- Hashing del token.
- Persistencia mediante repositorios.
- Acceso a mecanismos técnicos externos.

La implementación final debe respetar la arquitectura definida para el proyecto.

No introducir abstracciones innecesarias solamente para separar responsabilidades.

Si se requiere una interfaz para encapsular una capacidad técnica, debe ubicarse en Application y su implementación concreta en Infrastructure.

## 3. Revisar Refresh Token Rotation

Revisar la implementación de:

```text
RotateAsync
```

La rotación debe ser atómica.

El sistema no debe quedar en un estado inconsistente si ocurre un error durante la operación.

No debe ser posible terminar con:

```text
Refresh Token anterior revocado
+
nuevo Refresh Token no creado
```

ni con:

```text
nuevo Refresh Token creado
+
Refresh Token anterior todavía válido
```

La operación debe utilizar el mecanismo de transacciones definido por la arquitectura del proyecto.

La invalidación del Refresh Token anterior y la creación del nuevo Refresh Token deben formar parte de la misma operación transaccional.

## 4. Revisar manejo de fechas

Todas las fechas relacionadas con Refresh Tokens deben manejarse en UTC.

Esto incluye como mínimo:

- `CreatedAt`
- `ExpiresAt`
- `RevokedAt`

La comparación de expiración debe realizarse utilizando UTC.

No utilizar la hora local del servidor para determinar si un Refresh Token expiró.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- La Epic correspondiente: `epic-01.md`
- La User Story correspondiente: `us-0002.md`
- `TASK-API-0020`
- `TASK-API-0021`
- `TASK-API-0022`
- `TASK-API-0023`

Revisar además el código real de:

- `RefreshToken`
- `RefreshTokenRepository`
- `RefreshTokenService`
- `IRefreshTokenService`
- `IRefreshTokenRepository`
- `ApplicationDbContext`
- Configuración de `RefreshToken`
- Mecanismo de transacciones existente.

## Documentación

Si se modifica el modelo de dominio:

- Actualizar `domain.md`.

Si se modifica un servicio:

- Actualizar `services.md`.

Si se modifica un repositorio:

- Actualizar `repositories.md`.

Si se establece una nueva regla general reutilizable:

- Actualizar `backend-coding-rules.md`.

No modificar otros documentos si no corresponde.

## Criterio de finalización

La Task se considera finalizada cuando:

1. No existe una restricción implícita de un único Refresh Token activo por usuario.
2. `GetActiveTokenAsync` fue eliminado si no existe una necesidad funcional que lo justifique.
3. Las responsabilidades de `RefreshTokenService` respetan la arquitectura definida.
4. La generación criptográfica y las demás responsabilidades técnicas están correctamente encapsuladas.
5. Refresh Token Rotation es atómica.
6. La revocación del token anterior y la creación del nuevo token forman parte de la misma operación transaccional.
7. Todas las fechas de Refresh Tokens se manejan en UTC.
8. La implementación continúa soportando:
   - Expiración.
   - Revocación.
   - Detección de uso previo.
   - Refresh Token Rotation.
9. No se agregaron abstracciones innecesarias.
10. Los documentos correspondientes fueron actualizados.
11. `Application`, `Infrastructure` y `Api` compilan correctamente.
12. La Task queda lista para continuar con la implementación del servicio de autenticación y los endpoints de login y refresh.

---

## Resultado de la ejecución

### Cambios realizados

**Eliminación de `GetActiveTokenAsync`**
- No existe un requerimiento que establezca que un usuario solo puede tener un Refresh Token activo.
- Un usuario puede tener múltiples sesiones simultáneas (PC, celular, tablet, etc.).
- Se eliminó `GetActiveTokenAsync` de `IRefreshTokenService` y `RefreshTokenService`.
- Se eliminó `GetActiveByUserIdAsync` de `IRefreshTokenRepository` y `RefreshTokenRepository` por no tener uso.
- Se mantiene la posibilidad de que un usuario tenga múltiples Refresh Tokens activos.

**Refresh Token Rotation atómico**
- La rotación ya es atómica por construcción: el llamador (`AuthService`) utiliza `IUnitOfWork` para persistir todos los cambios del `DbContext` en una sola operación.
- `RenewAsync` marca el token anterior como revocado/usado y genera el nuevo dentro del mismo `DbContext`.
- Si ocurre un error intermedio, no se llama a `SaveChangesAsync` y el estado no cambia.
- No se introdujeron transacciones adicionales porque el mecanismo existente (`IUnitOfWork`) ya garantiza la atomicidad.

**Manejo de fechas en UTC**
- Verificado: todas las fechas (`CreatedAt`, `ExpiresAt`, `RevokedAt`) se manejan con `DateTime.UtcNow`.
- Las comparaciones de expiración utilizan UTC.

**Responsabilidades de `RefreshTokenService`**
- Se mantiene en `Infrastructure/Services/RefreshTokenService.cs` por consistencia con otros servicios técnicos del proyecto (`EmailService`, `JwtTokenGenerator`).
- No se introdujeron abstracciones innecesarias.
- La interfaz `IRefreshTokenService` permanece en `Application/Interfaces`.

**Documentación actualizada**
- `project/services.md`: Se eliminó la referencia a `GetActiveTokenAsync` y se actualizó la dependencia de `AuthService` a `IRefreshTokenSettingsProvider`.
- `project/repositories.md`: Se eliminó `GetActiveByUserIdAsync` de `RefreshTokenRepository`.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- No existe código muerto relacionado con Refresh Tokens.
- La implementación continúa soportando expiración, revocación, detección de uso previo y Refresh Token Rotation.
