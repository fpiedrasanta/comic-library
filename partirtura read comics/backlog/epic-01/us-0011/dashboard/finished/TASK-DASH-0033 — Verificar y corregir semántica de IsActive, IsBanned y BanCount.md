# TASK-DASH-0033 — Verificar y corregir semántica de IsActive, IsBanned y BanCount

## Task ID

TASK-DASH-0033

## Title

Verificar y corregir semántica de IsActive, IsBanned y BanCount

## Description

Revisar las implementaciones existentes del Dashboard relacionadas con usuarios y Bans para verificar que la interfaz no esté confundiendo:

- `User.IsActive`
- `Ban.IsActive`
- `IsBanned`
- `BanCount`

Esta task debe validar que el Dashboard interprete correctamente los contratos del backend y que no derive estados de negocio incorrectamente en el frontend.

Esta task es de **auditoría y corrección** sobre las implementaciones existentes.

## Reglas de negocio

### User.IsActive

Representa la baja lógica del usuario.

Un usuario con `User.IsActive = false` no debe aparecer en:

- listados normales de usuarios;
- selección de usuario para crear un Ban.

El Dashboard no debe convertir `IsActive` en `IsBanned`.

### Ban.IsActive

Representa si el registro histórico de Ban continúa administrativamente activo.

Un Ban con `Ban.IsActive = false` fue revocado/anulado y permanece únicamente como historial.

El Dashboard no debe tratar un Ban revocado como vigente.

### IsBanned

`IsBanned` representa si el usuario está actualmente baneado.

Debe utilizarse el valor proporcionado por el backend.

El Dashboard no debe calcular:

`IsBanned = BanCount > 0`

porque esa expresión es incorrecta.

Un usuario puede tener Bans históricos y no estar actualmente baneado.

### BanCount

Representa la cantidad histórica de Bans considerados válidos según el contrato del backend.

Los Bans revocados (`Ban.IsActive = false`) no deben incrementar este valor.

`BanCount` no debe utilizarse para determinar si un usuario está actualmente baneado.

## Alcance

Revisar como mínimo:

- `users-page.tsx`
- `bans-page.tsx`
- `bans-select-user-page.tsx`
- `ban-form-page.tsx`
- tipos relacionados con User y Ban
- servicios de User
- servicios de Ban
- componentes reutilizables de usuario
- badges de estado
- lógica de selección de usuario
- lógica de creación y edición de Ban
- manejo de respuesta del login

Revisar especialmente las implementaciones realizadas en:

- `TASK-DASH-0021`
- `TASK-DASH-0023`
- `TASK-DASH-0024`
- `TASK-DASH-0027`
- `TASK-DASH-0028`
- `TASK-DASH-0029`
- cualquier task posterior que utilice `IsActive`, `IsBanned` o `BanCount`

## Listado de usuarios

Verificar que:

- `IsActive` represente únicamente el estado de actividad de la cuenta;
- `IsBanned` se utilice para representar el baneo vigente;
- `BanCount` se muestre como cantidad histórica;
- no se determine visualmente `IsBanned` mediante `BanCount`;
- un usuario con Bans históricos finalizados pueda aparecer como no baneado.

## Selección de usuario para Ban

Verificar que:

- solamente se muestren usuarios activos;
- los usuarios actualmente baneados aparezcan como no seleccionables;
- el botón `Seleccionar` se encuentre deshabilitado cuando `IsBanned = true`;
- un usuario con `BanCount > 0` pero `IsBanned = false` siga siendo seleccionable;
- el frontend no intente determinar `IsBanned` por su cuenta a partir de fechas o `BanCount` si el backend ya proporciona el estado;
- la validación definitiva permanezca en el backend.

## Listado de Bans

Verificar que:

- el estado `Active`, `Finished` y `Revoked` se interprete según el contrato del backend;
- un Ban `Revoked` no sea presentado visualmente como activo;
- los filtros de Bans no confundan `Ban.IsActive` con `IsBanned` del usuario;
- los filtros de fecha continúen realizando correctamente la conversión local/UTC.

## Crear y editar Ban

Verificar que:

- solamente puedan seleccionarse usuarios activos;
- el usuario actualmente baneado no pueda seleccionarse para un nuevo Ban;
- la interfaz no utilice `BanCount` como criterio para impedir la selección;
- un usuario con historial de Bans pero sin Ban vigente pueda recibir un nuevo Ban;
- la validación definitiva de la operación sea responsabilidad del backend.

## Login

Revisar la integración del Dashboard con autenticación.

Verificar que:

- un usuario dado de baja (`User.IsActive = false`) no pueda acceder;
- un usuario con Ban vigente no pueda acceder;
- un usuario con Bans históricos finalizados pueda acceder;
- un usuario con Bans revocados pueda acceder;
- `BanCount > 0` no sea utilizado como condición suficiente para bloquear el acceso.

Si la API de autenticación ya devuelve un error específico para usuario baneado, utilizar el mecanismo existente de manejo de errores y no duplicar la lógica de vigencia en el Dashboard.

## No duplicar reglas de negocio

El Dashboard no debe convertirse en la fuente de verdad para determinar si un usuario está baneado.

El backend es responsable de determinar:

- `IsBanned`;
- vigencia del Ban;
- posibilidad efectiva de crear un nuevo Ban;
- autorización de acceso.

El Dashboard es responsable de representar correctamente esos estados y evitar acciones obviamente inválidas desde la interfaz.

## Criterios de aceptación

- [ ] `User.IsActive` no se interpreta como `IsBanned`.
- [ ] `Ban.IsActive` no se interpreta como `IsBanned`.
- [ ] `BanCount > 0` no se utiliza para determinar que un usuario está baneado.
- [ ] `IsBanned` se utiliza como fuente del estado actual de baneo.
- [ ] Un usuario con Bans históricos finalizados puede aparecer como no baneado.
- [ ] Un usuario con Bans revocados puede aparecer como no baneado.
- [ ] Usuarios inactivos no aparecen en la selección de usuario para Ban.
- [ ] Usuarios con `IsBanned = true` no pueden seleccionarse para crear un nuevo Ban.
- [ ] Usuarios con `BanCount > 0` e `IsBanned = false` sí pueden seleccionarse.
- [ ] El listado de Bans distingue correctamente `Active`, `Finished` y `Revoked`.
- [ ] La UI no duplica innecesariamente la lógica de vigencia del backend.
- [ ] El login del Dashboard respeta el estado de usuario y el Ban vigente.
- [ ] No se introducen llamadas adicionales al backend fuera de los servicios/API Client existentes.
- [ ] TypeScript compila correctamente.
- [ ] No se rompen las pantallas existentes de usuarios ni Bans.

## Expected Result

El Dashboard mantiene una separación clara entre:

`User.IsActive` → estado de actividad de la cuenta.

`Ban.IsActive` → estado administrativo del registro de Ban.

`IsBanned` → estado actual de baneo.

`BanCount` → historial de Bans.

La interfaz representa estos estados correctamente sin derivar uno a partir de otro de forma incorrecta.

## Execution Result

### Status

Planned

### Completed Work

No iniciada.

### Pending Work

Auditar las implementaciones existentes y corregir cualquier inconsistencia encontrada.

### Blocked task

TASK-API-0103

### Unblocked

Tasks posteriores de creación, edición y revocación de Bans.

### Assigned to

Frontend Dashboard Agent

### Status

Finished

### Completed Work

- Auditadas implementaciones existentes de usuarios y bans.
- Corregido `bans-select-user-page.tsx`: reemplazados datos MOCK hardcodeados por integración real con `GET /api/users/active-for-ban`.
- Corregido `ban-form-page.tsx`: eliminada derivación incorrecta `isBanned = existingBan.isActive` (Ban.IsActive).
- Corregido `ban-form-page.tsx`: eliminado hardcodeo de `banCount: 0` e `isActive: true` en modo edición.
- Corregido `ban-form-page.tsx`: el badge de estado en modo edición muestra el estado del ban (`Active`, `Finished`, `Revoked`) en lugar del estado de cuenta del usuario.
- Corregido `ban-form-page.tsx`: en modo edición se muestra `banCount` como `—` cuando no está disponible desde el backend.
- Verificado `users-page.tsx`: usa correctamente `isBanned` del backend sin derivarlo de `BanCount` o fechas.
- Verificado `auth.service.ts`: no contiene lógica de derivación de `IsBanned` ni `BanCount`.
- Verificado `use-auth.ts`: no contiene lógica de derivación de `IsBanned` ni `BanCount`.
- Verificado `auth-store.ts`: no contiene lógica de derivación de `IsBanned` ni `BanCount`.
- Verificado `bans-page.tsx`: distingue correctamente `Active`, `Finished` y `Revoked`.
- Verificado servicios y tipos: `ban.service.ts`, `auth.service.ts`, `types/ban.ts`, `types/auth.ts` respetan la semántica del backend.
- Confirmada separación clara: `User.IsActive` no se interpreta como `IsBanned`; `Ban.IsActive` no se interpreta como `IsBanned`; `BanCount > 0` no se usa para determinar baneo actual.
- Dashboard compila correctamente.

### Pending Work

Ninguno.

### Blocked task

Ninguno.

### Unblocked

Ninguno. Tareas de bans finalizadas.