# TASK-API-0037 — Crear modelo y persistencia para recuperación de contraseña

## Objetivo

Crear la entidad y la persistencia necesarias para soportar el flujo de recuperación de contraseña definido en `US-0003`.

La implementación debe permitir:

- Generar códigos de recuperación de 6 dígitos.
- Asociarlos a un usuario.
- Definir una fecha de expiración.
- Invalidarlos una vez utilizados.
- Invalidar códigos anteriores cuando se genera uno nuevo.
- Mantener el historial de intentos de recuperación sin permitir reutilizar códigos vencidos o utilizados.

La persistencia debe almacenar únicamente el hash del código, nunca el código en texto plano.

---

## Contexto obligatorio

Antes de comenzar, leer:

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

También revisar las implementaciones existentes relacionadas con:

- `User`
- `UserRepository`
- `UnitOfWork`
- validación de email
- Refresh Tokens
- generación y hashing de tokens/códigos

---

## Entidad

Crear una entidad específica para representar un intento de recuperación de contraseña.

El nombre debe seguir las convenciones existentes del proyecto.

Como mínimo debe contemplar:

- Identificador.
- `UserId`.
- Navegación hacia `User`.
- Hash del código.
- Fecha de creación en UTC.
- Fecha de expiración en UTC.
- Fecha de utilización, nullable.

No almacenar el código de 6 dígitos en texto plano.

---

## Reglas de negocio persistentes

La entidad debe permitir determinar si un código:

- existe;
- pertenece a un usuario;
- está vigente;
- está expirado;
- ya fue utilizado.

Cuando se genere un nuevo código para un usuario:

- Los códigos anteriores que todavía estuvieran vigentes deben quedar invalidados.
- No debe ser posible utilizar posteriormente un código anterior.

No implementar esta lógica mediante un servicio de Infrastructure que oculte llamadas al Repository.

La coordinación del caso de uso corresponde a Application.

---

## Repository

Crear la interfaz del repositorio en:

```text
Application/Interfaces
```

Crear la implementación concreta en:

```text
Infrastructure/Repositories
```

El repository debe limitarse a operaciones de persistencia y consulta.

Como mínimo deberá permitir:

- Obtener códigos de recuperación asociados a un usuario.
- Obtener un código mediante su hash.
- Agregar un nuevo código.
- Actualizar un código existente.

No crear:

- `IRepository<T>`
- `Repository<T>`
- `GenericRepository`
- abstracciones genéricas equivalentes.

No incorporar lógica de negocio en el repository.

---

## Entity Framework Core

Crear la configuración correspondiente en:

```text
Infrastructure/Persistence/Configurations
```

Configurar:

- tabla;
- claves;
- relación con `User`;
- índices necesarios;
- longitudes de campos;
- comportamiento de eliminación.

El hash debe estar preparado para búsqueda eficiente.

Las fechas deben almacenarse y manejarse en UTC.

---

## Documentación

Actualizar:

### `domain.md`

Documentar:

- nueva entidad;
- propiedades;
- relación con `User`;
- propósito.

### `repositories.md`

Documentar:

- nuevo repository;
- operaciones disponibles;
- responsabilidad.

No modificar `backend-stack-technology.md` salvo que realmente se incorpore una nueva dependencia tecnológica.

---

## Criterios de finalización

La Task está terminada cuando:

1. Existe una entidad para representar códigos de recuperación.
2. El código raw nunca se persiste.
3. Se persiste únicamente su hash.
4. Se registra creación y expiración en UTC.
5. Se puede determinar si un código fue utilizado.
6. Existe un repository específico para la entidad.
7. El repository solamente maneja persistencia/consulta.
8. No existe un repository genérico.
9. Existe configuración EF Core.
10. La relación con `User` está correctamente configurada.
11. `domain.md` está actualizado.
12. `repositories.md` está actualizado.
13. `Application` compila.
14. `Infrastructure` compila.

---

## Resultado de la ejecución

### Cambios realizados

**`Domain/Entities/PasswordResetToken.cs`** (nuevo)
- Entidad con `Id`, `UserId`, `User`, `TokenHash`, `CreatedAt`, `ExpiresAt`, `UsedAt`.
- No almacena el código raw.

**`Domain/Entities/User.cs`** (modificado)
- Se agregó `ICollection<PasswordResetToken> PasswordResetTokens`.

**`Application/Interfaces/IPasswordResetTokenRepository.cs`** (nuevo)
- Interfaz con operaciones: `AddAsync`, `GetByTokenHashAsync`, `GetActiveByUserIdAsync`, `UpdateAsync`.

**`Infrastructure/Repositories/PasswordResetTokenRepository.cs`** (nuevo)
- Implementación concreta con Entity Framework Core.
- `GetActiveByUserIdAsync` filtra códigos no usados y no expirados.

**`Infrastructure/Persistence/Configurations/PasswordResetTokenConfiguration.cs`** (nuevo)
- Configuración EF Core para `PasswordResetToken`:
  - Tabla `PasswordResetTokens`.
  - `TokenHash` con longitud 512.
  - Relación con `User` mediante `UserId` con `DeleteBehavior.Cascade`.
  - Índice en `UserId`.

**`Infrastructure/Persistence/ApplicationDbContext.cs`** (modificado)
- Se agregó `DbSet<PasswordResetToken> PasswordResetTokens`.
- Se registró `PasswordResetTokenConfiguration` en `OnModelCreating`.

**Migración**
- Se generó la migración `20260818225028_AddPasswordResetToken`.
- Se aplicó la migración a la base de datos.
- Se creó la tabla `PasswordResetTokens` con su foreign key, índice y columna `UsedAt`.

**`project/domain.md`** (actualizado)
- Se agregó la sección `### PasswordResetToken` documentando la entidad, sus propiedades, relación con `User` y reglas.

**`project/repositories.md`** (actualizado)
- Se agregó la sección `## PasswordResetTokenRepository` con sus operaciones y notas.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- La migración fue aplicada exitosamente.
- No se incorporaron nuevas dependencias tecnológicas.
