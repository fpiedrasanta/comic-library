# TASK-API-0091 — Completar datos derivados y ordenamiento de consulta de usuarios

## Objetivo

Completar la consulta paginada de usuarios implementada en `UserRepository.GetPagedAsync` para cumplir íntegramente con el contrato definido para US-0010.

La consulta debe devolver y permitir ordenar correctamente por todos los campos requeridos por la grilla administrativa.

## Datos derivados

La consulta debe calcular para cada usuario:

### `BanCount`

Cantidad total histórica de registros `Ban` asociados al usuario.

Debe incluir:

- baneos finalizados;
- baneos actualmente vigentes;
- baneos permanentes;
- cualquier otro registro histórico de `Ban`.

No debe representar únicamente la cantidad de baneos activos.

### `IsBanned`

Debe indicar si el usuario posee actualmente un `Ban` vigente.

La condición de vigencia es:

```text
StartDate <= ahora
AND
(EndDate IS NULL OR EndDate > ahora)
```

Un usuario con baneos históricos pero ninguno vigente debe devolver:

```text
IsBanned = false
```

## Ordenamiento

Completar `GetPagedAsync` para soportar todos los campos definidos como ordenables:

- `LastName`
- `Email`
- `IsActive`
- `IsBanned`
- `BanCount`
- `CreatedAt`

La dirección debe soportar:

- `ASC`
- `DESC`

## Ordenamiento por defecto

Cuando no se indique `orderBy`, utilizar:

```text
CreatedAt DESC
```

Es decir, los usuarios registrados más recientemente aparecen primero.

Cuando no se indique `orderDir`, utilizar:

```text
DESC
```

## Reglas importantes

### BanCount

El ordenamiento por cantidad de baneos debe ejecutarse en la consulta de base de datos.

No se debe:

1. obtener todos los usuarios;
2. obtener los baneos en memoria;
3. calcular `BanCount`;
4. ordenar posteriormente.

La operación debe poder ejecutarse sobre la consulta SQL generada por EF Core.

### IsBanned

El filtro y el ordenamiento por `IsBanned` también deben resolverse en la consulta de base de datos.

No debe cargarse el listado completo en memoria para determinar el estado de baneo.

### Paginación

La paginación debe aplicarse después de los filtros y ordenamiento.

El orden conceptual de la consulta debe ser:

```text
Usuarios
    ↓
Search
    ↓
IsActive
    ↓
IsBanned
    ↓
Ordenamiento
    ↓
Paginación
    ↓
Projection
```

La implementación puede utilizar la estrategia equivalente que resulte más apropiada para EF Core, siempre que mantenga el comportamiento esperado y sea traducible a SQL.

## Performance

La consulta debe mantener:

- `AsNoTracking()`.
- Sin consultas N+1.
- Sin cargar todos los usuarios en memoria.
- Sin cargar todos los `Ban` en memoria.
- Cálculo de `BanCount` e `IsBanned` dentro de la consulta.

## Criterios de aceptación

- [ ] `UserListItemDto` devuelve `BanCount`.
- [ ] `UserListItemDto` devuelve `IsBanned`.
- [ ] `BanCount` incluye todo el historial de baneos.
- [ ] `IsBanned` representa únicamente el estado actual.
- [ ] Se puede filtrar por `IsBanned`.
- [ ] Se puede ordenar por `IsBanned`.
- [ ] Se puede ordenar por `BanCount`.
- [ ] Se puede ordenar por `LastName`.
- [ ] Se puede ordenar por `Email`.
- [ ] Se puede ordenar por `IsActive`.
- [ ] Se puede ordenar por `CreatedAt`.
- [ ] Se soporta `ASC`.
- [ ] Se soporta `DESC`.
- [ ] El ordenamiento por defecto es `CreatedAt DESC`.
- [ ] El cálculo de `BanCount` se ejecuta en base de datos.
- [ ] El cálculo de `IsBanned` se ejecuta en base de datos.
- [ ] No se cargan todos los usuarios en memoria.
- [ ] No se cargan todos los baneos en memoria.
- [ ] No existen consultas N+1.
- [ ] `AsNoTracking()` continúa utilizándose.
- [ ] La paginación se aplica después de filtros y ordenamiento.
- [ ] La consulta continúa siendo exclusivamente de lectura.

## Fuera de alcance

Esta task no implementa:

- creación de baneos;
- modificación de baneos;
- eliminación de baneos;
- bloqueo de usuarios;
- invalidación de sesiones;
- validación de baneo durante login;
- middleware de validación de baneo;
- endpoint HTTP de consulta de usuarios.

## Execution Result

### Status
Finished

### Completed Work
- `UserRepository.GetPagedAsync` actualizado para calcular `BanCount` e `IsBanned` dentro de la consulta SQL.
- Ordenamiento implementado para `LastName`, `Email`, `IsActive`, `IsBanned`, `BanCount`, `CreatedAt`.
- Ambas direcciones (`ASC`, `DESC`) soportadas.
- Ordenamiento por defecto: `CreatedAt DESC`.
- Paginación después de filtros y ordenamiento.
- `AsNoTracking()` mantenido.
- Sin consultas N+1.
- `UserQueryService` actualizado para usar `UserPagedItem`.
- `endpoints.md` actualizado.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0090 - Definir entidad Ban y repositorio base

### Assigned to
Backend Agent