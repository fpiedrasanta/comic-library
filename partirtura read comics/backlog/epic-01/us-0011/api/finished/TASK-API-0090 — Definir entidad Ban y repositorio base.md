# TASK-API-0090 — Definir entidad Ban y repositorio base

## Objetivo

Definir la entidad de dominio `Ban` que representa una **sanción de bloqueo de acceso aplicada a un usuario**.

Un usuario puede tener múltiples baneos a lo largo de su vida. Cada baneo representa un registro histórico independiente y debe conservarse aunque posteriormente finalice, sea eliminado o deje de estar vigente.

La entidad debe permitir representar:

- Baneo temporal.
- Baneo permanente.
- Fecha y hora desde la cual comienza el baneo.
- Fecha y hora hasta la cual permanece vigente.
- Motivo del baneo.

La existencia de un baneo histórico **no significa que el usuario esté actualmente baneado**.

Un usuario se considera actualmente baneado cuando existe un `Ban` cuya vigencia comprende el momento actual.

## Reglas de negocio

### 1. Múltiples baneos

Un mismo usuario puede tener múltiples registros `Ban`.

Ejemplo:

```text
Usuario: Juan Pérez

Ban #1
Desde: 01/08/2026
Hasta: 03/08/2026
Motivo: Comentarios con insultos.

Ban #2
Desde: 10/08/2026
Hasta: 17/08/2026
Motivo: Reincidencia.

Ban #3
Desde: 20/08/2026
Hasta: null
Motivo: Incumplimiento reiterado de las normas.
```

El usuario tiene `BanCount = 3`, pero `IsBanned` depende exclusivamente de la vigencia de los baneos.

### 2. Baneo temporal

Un baneo temporal posee:

- `StartDate`
- `EndDate`
- `Reason`

El usuario está baneado cuando:

```text
StartDate <= ahora
AND
EndDate > ahora
```

### 3. Baneo permanente

Un baneo permanente posee:

- `StartDate`
- `EndDate = null`
- `Reason`

Un baneo permanente se considera vigente desde `StartDate` en adelante.

### 4. Historial

Los baneos finalizados deben conservarse como historial.

No debe eliminarse un `Ban` simplemente porque haya dejado de estar vigente.

La cantidad de baneos de un usuario debe poder obtenerse contando sus registros históricos.

### 5. Independencia respecto de User.IsActive

`Ban` y `User.IsActive` representan conceptos diferentes.

- `User.IsActive = false` representa una cuenta dada de baja.
- `Ban` representa una sanción de acceso.
- Un usuario puede estar `IsActive = true` y actualmente baneado.
- Un usuario puede estar `IsActive = true` y no estar baneado.
- Un usuario dado de baja puede conservar su historial de baneos.

No debe modificarse `User.IsActive` al crear un `Ban`.

### 6. Identidad del usuario

Cada `Ban` pertenece a exactamente un `User`.

El `UserId` debe representar la relación con el usuario sancionado.

La identidad del usuario no debe depender de email, nombre u otros datos que puedan modificarse o repetirse.

## Modelo de dominio

Crear:

`Domain/Entities/Ban.cs`

La entidad debe contener como mínimo:

- `Id`
- `UserId`
- `StartDate`
- `EndDate?`
- `Reason`
- navegación a `User`, de acuerdo con las convenciones existentes del proyecto.

### Restricciones

- `StartDate` es obligatorio.
- `EndDate` es opcional.
- `Reason` es obligatorio.
- `EndDate = null` representa un baneo permanente.
- `EndDate` no debe ser anterior a `StartDate`.

La validación de reglas de negocio debe respetar la arquitectura existente.

## Persistencia

Crear:

`Infrastructure/Persistence/Configurations/BanConfiguration.cs`

Configurar:

- clave primaria.
- relación `Ban -> User`.
- `UserId` como foreign key.
- `StartDate`.
- `EndDate`.
- `Reason`.
- índice sobre `UserId` y `StartDate`.

La configuración debe evitar propiedades shadow innecesarias y declarar explícitamente la foreign key cuando corresponda.

## Repository

Crear:

`Application/Interfaces/IBanRepository.cs`

y:

`Infrastructure/Repositories/BanRepository.cs`

El repository debe permitir como mínimo:

- `AddAsync`
- `GetByIdAsync`
- `GetActiveByUserIdAsync`
- `GetAllByUserIdAsync`

### `GetActiveByUserIdAsync`

Debe devolver el baneo vigente del usuario en el momento de la consulta.

La condición de vigencia debe contemplar:

```text
StartDate <= ahora
AND
(EndDate IS NULL OR EndDate > ahora)
```

No debe considerar como activo un baneo cuya fecha de inicio todavía no haya llegado.

No debe considerar como activo un baneo cuya fecha de finalización ya haya pasado.

### `GetAllByUserIdAsync`

Debe devolver todos los baneos históricos del usuario, independientemente de que estén:

- activos,
- finalizados,
- futuros.

## Preparación para consultas administrativas

El repository debe quedar preparado para que las próximas tareas puedan obtener:

- cantidad histórica de baneos (`BanCount`);
- existencia de un baneo vigente (`IsBanned`);
- información del baneo vigente.

Estas propiedades deberán ser calculadas en la consulta/servicio correspondiente y **no persistidas como columnas redundantes en `User`**.

No crear en esta task:

- `User.IsBanned`.
- `User.BanCount`.
- campos equivalentes persistidos en `User`.

## Migración

Generar la migración correspondiente a la nueva entidad `Ban`.

La migración debe:

- crear la tabla correspondiente;
- crear la foreign key hacia `User`;
- crear los índices definidos;
- no modificar ni eliminar datos existentes de `User`.

## Documentación

Actualizar:

- `project/domain.md`
- `project/repositories.md`

Documentar:

- concepto de `Ban`;
- relación con `User`;
- diferencia entre baneo vigente e historial de baneos;
- baneo temporal;
- baneo permanente;
- operaciones disponibles en `IBanRepository`.

## Fuera de alcance

Esta task **no implementa todavía**:

- creación de baneos;
- edición de baneos;
- eliminación de baneos;
- endpoints de administración de baneos;
- autorización administrativa para banear;
- bloqueo del login por baneo;
- invalidación de sesiones de un usuario baneado;
- middleware para expulsar usuarios ya autenticados;
- consulta administrativa paginada de usuarios;
- cálculo de `BanCount` e `IsBanned` en el endpoint de usuarios.

Esas funcionalidades serán implementadas en tasks posteriores.

## Criterios de aceptación

- [ ] Existe `Domain/Entities/Ban.cs`.
- [ ] `Ban` representa una sanción independiente e histórica.
- [ ] Un usuario puede tener múltiples `Ban`.
- [ ] `Ban` contiene `UserId`.
- [ ] `Ban` contiene `StartDate`.
- [ ] `Ban` contiene `EndDate` nullable.
- [ ] `Ban` contiene `Reason`.
- [ ] `EndDate = null` representa un baneo permanente.
- [ ] Un baneo finalizado permanece almacenado como historial.
- [ ] `Ban` no modifica `User.IsActive`.
- [ ] Existe la relación explícita entre `Ban` y `User`.
- [ ] Existe `BanConfiguration`.
- [ ] Existe `IBanRepository`.
- [ ] Existe `BanRepository`.
- [ ] `GetActiveByUserIdAsync` determina correctamente la vigencia del baneo.
- [ ] `GetAllByUserIdAsync` permite consultar el historial completo.
- [ ] Existe índice para consultas por usuario y fecha de inicio.
- [ ] Se generó la migración correspondiente.
- [ ] `domain.md` fue actualizado.
- [ ] `repositories.md` fue actualizado.
- [ ] No se agregaron propiedades persistidas `IsBanned` ni `BanCount` a `User`.

## Expected Result

- Entidad `Ban` en `Domain/Entities`.
- Configuración EF Core en `Infrastructure/Persistence/Configurations/BanConfiguration.cs`.
- Interfaz `IBanRepository` en `Application/Interfaces`.
- Implementación `BanRepository` en `Infrastructure/Repositories`.
- Operaciones básicas: `AddAsync`, `GetActiveByUserIdAsync`, `GetAllByUserIdAsync`, `GetByIdAsync`.
- Migración generada y aplicable.
- `domain.md`, `repositories.md` actualizados.

## Relevant Context

User Story: US-0012 — Administrar bloqueos/baneos de usuarios (a definir).

Dependencies:
- TASK-API-0085
- TASK-API-0086
- TASK-API-0087
- TASK-API-0088
- TASK-API-0089

## Acceptance Criteria

- [ ] Existe la entidad `Ban` en `Domain/Entities/Ban.cs`.
- [ ] `Ban` posee las propiedades necesarias para representar vigencia (`StartDate`, `EndDate?`, `Reason`).
- [ ] `BanConfiguration` define la relación con `User` y el índice compuesto por `UserId` + `StartDate`.
- [ ] `IBanRepository` define las operaciones necesarias para consultar baneos de un usuario.
- [ ] `BanRepository` implementa las operaciones con EF Core.
- [ ] Se generó la migración correspondiente.
- [ ] `domain.md` documenta la nueva entidad.
- [ ] `repositories.md` documenta el nuevo repository.

## Execution Result

### Status
Finished

### Completed Work
- Entidad `Ban` creada en `Domain/Entities/Ban.cs`.
- `BanConfiguration` creada en `Infrastructure/Persistence/Configurations/BanConfiguration.cs`.
- `IBanRepository` creada en `Application/Interfaces/IBanRepository.cs`.
- `BanRepository` creada en `Infrastructure/Repositories/BanRepository.cs`.
- `ApplicationDbContext` actualizado con `DbSet<Ban>` y configuración aplicada.
- Migración `20260824183823_CreateBanEntity` generada.
- `project/domain.md` actualizado con la entidad `Ban`.
- `project/repositories.md` actualizado con `BanRepository`.
- Servicio `IBanRepository` registrado en `Program.cs`.

### Pending Work
Ninguna. La task está completa.

### Blocked task
Ninguna. Esta task desbloquea TASK-API-0085, TASK-API-0086, TASK-API-0087, TASK-API-0088 y TASK-API-0089.

### Assigned to
Backend Agent
