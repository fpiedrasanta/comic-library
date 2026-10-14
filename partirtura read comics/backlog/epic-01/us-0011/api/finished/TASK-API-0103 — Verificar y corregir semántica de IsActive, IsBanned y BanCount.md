# TASK-API-0103 — Verificar y corregir semántica de IsActive, IsBanned y BanCount

## Task ID

TASK-API-0103

## Title

Verificar y corregir semántica de IsActive, IsBanned y BanCount

## Description

Revisar las implementaciones existentes relacionadas con usuarios y Bans para verificar que no se esté confundiendo:

- `User.IsActive`
- `Ban.IsActive`
- `IsBanned`
- `BanCount`

Estas propiedades representan conceptos diferentes y deben mantenerse separados en todas las consultas, servicios, endpoints y validaciones del backend.

Esta task es de **auditoría y corrección** sobre las implementaciones existentes. No debe asumirse que el código actual es correcto.

## Reglas de negocio obligatorias

### User.IsActive

`User.IsActive` representa la baja lógica del usuario.

- `true`: el usuario está activo dentro del sistema.
- `false`: el usuario fue dado de baja lógicamente.

Los usuarios con `User.IsActive = false` no deben participar de las operaciones normales del sistema.

En particular, no deben:

- aparecer en listados normales de usuarios;
- aparecer en la selección de usuarios para crear un Ban;
- poder autenticarse;
- ser considerados para las consultas normales del Dashboard;
- afectar estadísticas o conteos de usuarios activos.

No se debe eliminar físicamente un usuario.

### Ban.IsActive

`Ban.IsActive` representa si el registro histórico de Ban continúa siendo válido administrativamente.

- `true`: el registro de Ban no fue revocado/anulado.
- `false`: el Ban fue revocado/anulado mediante baja lógica.

Un Ban con `IsActive = false` permanece almacenado para conservar el historial, pero no debe considerarse un Ban válido para las reglas actuales del sistema.

Un Ban nunca debe eliminarse físicamente.

### IsBanned

`IsBanned` es un estado derivado.

No debe confundirse con `User.IsActive` ni con `Ban.IsActive`.

Un usuario está actualmente baneado cuando existe al menos un Ban que cumpla:

- `Ban.IsActive = true`
- `Ban.StartDate <= ahora`
- `Ban.EndDate IS NULL OR Ban.EndDate > ahora`

Conceptualmente:

`IsBanned = existe un Ban activo cuya vigencia comprende el momento actual`

Un usuario puede tener historial de Bans y no estar actualmente baneado.

Por ejemplo:

- `BanCount = 5`
- `IsBanned = false`

es un estado válido.

### BanCount

`BanCount` debe contar únicamente los registros de Ban con:

`Ban.IsActive = true`

Los Bans revocados/anulados (`Ban.IsActive = false`) no deben incrementar `BanCount`.

`BanCount` tampoco determina si el usuario está actualmente baneado.

## Alcance de revisión

Revisar como mínimo:

- `UserRepository`
- `BanRepository`
- `UserQueryService`
- `BanService`
- DTOs relacionados
- consultas de usuarios
- consulta de Bans
- consulta de usuarios disponibles para Ban
- validación de autenticación/login
- cualquier otra consulta donde se utilicen `IsActive`, `IsBanned` o `BanCount`

Revisar específicamente las implementaciones realizadas en:

- `TASK-API-0091`
- `TASK-API-0093`
- `TASK-API-0094`
- `TASK-API-0096`
- `TASK-API-0097`, si ya se encuentra implementada
- endpoints y servicios de autenticación relacionados

## Validaciones específicas

### Listado de usuarios

Verificar que:

- usuarios con `User.IsActive = false` sean excluidos cuando corresponda;
- `IsBanned` se calcule por vigencia real del Ban;
- Bans con `Ban.IsActive = false` sean ignorados;
- `BanCount` excluya Bans con `Ban.IsActive = false`;
- `BanCount` no determine `IsBanned`.

### Selección de usuario para Ban

Verificar que:

- solamente se puedan seleccionar usuarios con `User.IsActive = true`;
- un usuario con un Ban vigente no pueda recibir otro Ban;
- un usuario con Bans históricos finalizados sí pueda recibir un nuevo Ban;
- un Ban revocado no impida crear un nuevo Ban;
- la validación exista en backend y no dependa únicamente del estado visual del Dashboard.

### Listado de Bans

Verificar que los Bans con `Ban.IsActive = false` no sean tratados como Bans vigentes.

Si el listado administrativo necesita mostrar historial de Bans revocados, deberán poder distinguirse claramente como `Revoked` y no deben confundirse con Bans activos.

La implementación debe respetar el contrato funcional definido para el listado.

### Login

Verificar la validación de Ban en:

- Public Web.
- Dashboard.

El acceso debe considerar:

1. `User.IsActive`.
2. Existencia de un Ban vigente.

Un usuario que tenga solamente Bans históricos finalizados o revocados no debe ser bloqueado.

Un usuario con `BanCount > 0` no debe ser bloqueado únicamente por tener historial de Bans.

## Regla de fecha

El backend trabaja internamente con UTC.

La determinación de `IsBanned` debe utilizar el momento actual en UTC y comparar contra `StartDate` y `EndDate` almacenados en UTC.

No introducir conversiones a hora local dentro de repositories o servicios de consulta.

## Persistencia

No eliminar físicamente registros.

La revocación de un Ban debe establecer:

`Ban.IsActive = false`

y conservar el registro y sus fechas para auditoría/historial.

## Criterios de aceptación

- [ ] `User.IsActive` se utiliza exclusivamente como indicador de baja lógica del usuario.
- [ ] `Ban.IsActive` se utiliza exclusivamente para determinar si el registro de Ban continúa administrativamente activo.
- [ ] `IsBanned` se calcula exclusivamente a partir de la existencia de un Ban vigente y activo.
- [ ] Un Ban revocado (`Ban.IsActive = false`) nunca produce `IsBanned = true`.
- [ ] Un Ban revocado no incrementa `BanCount`.
- [ ] Un Ban finalizado no produce `IsBanned = true`.
- [ ] Un usuario con Bans históricos puede tener `IsBanned = false`.
- [ ] `BanCount > 0` no implica `IsBanned = true`.
- [ ] Usuarios con `User.IsActive = false` no participan de las consultas normales correspondientes.
- [ ] La selección de usuario para un nuevo Ban valida `User.IsActive`.
- [ ] La selección de usuario para un nuevo Ban valida la existencia de un Ban vigente.
- [ ] El backend impide crear un nuevo Ban sobre un usuario actualmente baneado.
- [ ] Login de Public Web considera correctamente `User.IsActive` y Ban vigente.
- [ ] Login de Dashboard considera correctamente `User.IsActive` y Ban vigente.
- [ ] No existen eliminaciones físicas de usuarios ni Bans.
- [ ] Las consultas no generan N+1.
- [ ] Las consultas de solo lectura utilizan `AsNoTracking()` cuando corresponde.
- [ ] Los cálculos de vigencia utilizan UTC.
- [ ] Se revisaron y corrigieron las implementaciones realizadas en las tasks indicadas.
- [ ] Se actualizaron `domain.md`, `repositories.md` o `endpoints.md` únicamente si la revisión detecta que su documentación contradice la regla funcional.

## Expected Result

El backend mantiene una separación inequívoca entre:

`User.IsActive` → baja lógica del usuario.

`Ban.IsActive` → baja lógica/revocación del registro histórico de Ban.

`IsBanned` → existencia de un Ban actualmente vigente.

`BanCount` → cantidad de Bans no revocados considerados para el historial.

## Execution Result

### Status
Finished

### Completed Work
- **User.IsActive**: Se utiliza exclusivamente como baja lógica del usuario. Verificado en:
  - `UserRepository.GetPagedAsync`: filtra por `User.IsActive` cuando se solicita.
  - `UserRepository.GetActiveForBanSelectionAsync`: filtra `User.IsActive = true`.
  - `AuthService.LoginAsync` y `LoginWithGoogleAsync`: rechazan usuarios inactivos.
- **Ban.IsActive**: Se utiliza exclusivamente para determinar si el registro de Ban continúa administrativamente activo. Verificado en:
  - `BanRepository.GetActiveByUserIdAsync`: filtra por `Ban.IsActive = true` y vigencia actual.
  - `BanService.DeactivateBanAsync`: establece `Ban.IsActive = false` sin eliminar el registro.
  - `BanService.CreateBanAsync`: crea con `Ban.IsActive = true`.
- **IsBanned**: Se calcula exclusivamente a partir de la existencia de un Ban vigente (`Ban.IsActive = true`, `StartDate <= now`, `EndDate IS NULL OR EndDate > now`). Verificado en:
  - `UserRepository.GetPagedAsync`: `IsBanned` deriva de banStats con la condición de vigencia completa.
  - `UserRepository.GetActiveForBanSelectionAsync`: mismo cálculo consistente.
- **BanCount**: Cuenta únicamente Bans con `Ban.IsActive = true`. Verificado en:
  - `UserRepository.GetPagedAsync`: `g.Count(b => b.IsActive)`.
  - `UserRepository.GetActiveForBanSelectionAsync`: `g.Count(b => b.IsActive)`.
  - `BanRepository.GetPagedAsync`: `BanCount` se proyecta desde el repositorio; los Bans revocados no se cuentan.
- Un Ban revocado (`Ban.IsActive = false`) nunca produce `IsBanned = true` ni incrementa `BanCount`.
- Un Ban finalizado no produce `IsBanned = true`.
- No existen eliminaciones físicas de usuarios ni Bans.
- Las consultas utilizan `AsNoTracking()` cuando corresponde.
- Los cálculos de vigencia utilizan `DateTime.UtcNow`.
- No se generan consultas N+1 en las consultas revisadas.
- No fue necesario modificar `domain.md`, `repositories.md` o `endpoints.md` porque la documentación ya coincide con las reglas funcionales.

### Pending Work
Ninguna. La semántica es correcta en todas las implementaciones revisadas.

### Unblocked by
TASK-API-0090, TASK-API-0091 (trabajo previo ya incorporado)

### Unblocks
TASK-API-0104, TASK-API-0105

### Assigned to
Backend Agent