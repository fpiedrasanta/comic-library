# TASK-API-0021 — Crear repositorios de autenticación

## Objetivo

Crear las interfaces y los repositorios necesarios para acceder a los datos utilizados por el mecanismo de autenticación.

## Alcance

La Task debe implementar las operaciones necesarias para:

- Buscar usuarios por email.
- Persistir Refresh Tokens.
- Buscar Refresh Tokens.
- Revocar Refresh Tokens.
- Realizar las operaciones adicionales que sean necesarias para implementar el flujo de autenticación.

Las interfaces deben estar ubicadas en la capa correspondiente según la arquitectura definida.

Los repositorios concretos deben implementarse en Infrastructure utilizando Entity Framework Core.

## Consideraciones

No crear un Repository genérico.

Los repositorios deben representar capacidades concretas del dominio y de los casos de uso.

La implementación debe respetar las reglas existentes sobre repositorios.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente: `epic-01.md`
- La User Story correspondiente: `us-0002.md`

Revisar además los repositorios existentes relacionados con usuarios.

## Documentación

Si como resultado de la implementación se incorpora una nueva dependencia:

- Actualizar `backend-stack-technology.md`.

Si se incorpora o modifica un servicio:

- Actualizar `services.md`.

Si se establece una regla general reutilizable para el manejo de contraseñas:

- Actualizar `backend-coding-rules.md`.

Si como resultado de la implementación se incorpora o modifican entidades:
- Actualizar: `domain.md`

Si como resultado de la implementación se incorpora o modifican repositorios:
- Actualizar: `repositories.md`

Si como resultado de la implementación se incorpora o modifican end-points:
- Actualizar: `endpoints.md`

Si como resultado de la implementación se identifican errores en la comunicación:
- Actualizar/corregir: `communication.md`

## Criterio de finalización

La Task se considera finalizada cuando:

1. Existe una interfaz para las operaciones necesarias de autenticación.
2. Existe una implementación concreta en Infrastructure.
3. Es posible buscar usuarios por email.
4. Es posible persistir Refresh Tokens.
5. Es posible recuperar Refresh Tokens.
6. Es posible revocar Refresh Tokens.
7. No se creó un Repository genérico.
8. `repositories.md` está actualizado.

---

## Resultado de la ejecución

### Cambios realizados

**`Application/Interfaces/IRefreshTokenRepository.cs`** (nuevo)
- Interfaz con operaciones: `AddAsync`, `GetByTokenHashAsync`, `GetActiveByUserIdAsync`, `UpdateAsync`.

**`Infrastructure/Repositories/RefreshTokenRepository.cs`** (nuevo)
- Implementación concreta utilizando Entity Framework Core.
- `GetByTokenHashAsync`: busca un refresh token por su hash.
- `GetActiveByUserIdAsync`: obtiene los tokens activos de un usuario (no usados, no revocados, no expirados).
- `AddAsync` / `UpdateAsync`: operaciones de persistencia.

**`Infrastructure/Persistence/ApplicationDbContext.cs`** (modificado)
- Se agregó `DbSet<RefreshToken> RefreshTokens`.
- Se registró `RefreshTokenConfiguration` en `OnModelCreating`.

**`Infrastructure/Persistence/Configurations/RefreshTokenConfiguration.cs`** (nuevo)
- Configuración de EF Core para `RefreshToken`:
  - Tabla `RefreshTokens`.
  - `TokenHash` como índice único (longitud 512).
  - Relación con `User` mediante `UserId` con `DeleteBehavior.Cascade`.

**`project/repositories.md`** (actualizado)
- Se agregó la sección `RefreshTokenRepository` con sus operaciones y notas.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- No se creó un Repository genérico.
- Las operaciones permiten buscar, persistir y revocar Refresh Tokens.
