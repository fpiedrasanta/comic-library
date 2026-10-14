# TASK-API-0104 — Validar manejo de fechas exclusivamente en UTC

## Objetivo

Revisar y garantizar que todo el Backend trabaje exclusivamente con fechas en UTC.

El Backend debe:

* Recibir fechas en UTC desde los clientes.
* Procesar fechas en UTC.
* Persistir fechas en UTC.
* Retornar fechas en UTC.

El Backend **no debe realizar conversiones entre hora local y UTC**.

La conversión entre hora local y UTC es responsabilidad exclusiva de los Frontends.

## Regla arquitectónica

La responsabilidad de fechas queda definida de la siguiente manera:

```text
Dashboard / Public Web
        │
        │ Fecha local → UTC
        ▼
      API
        │
        │ UTC
        ▼
    Application
        │
        │ UTC
        ▼
   Repository
        │
        │ UTC
        ▼
    Database
```

Y al retornar información:

```text
Database
    │
    │ UTC
    ▼
Repository
    │
    │ UTC
    ▼
Application
    │
    │ UTC
    ▼
API
    │
    │ UTC
    ▼
Dashboard / Public Web
    │
    │ UTC → hora local
    ▼
   UI
```

## Alcance

Revisar todas las implementaciones relacionadas con Ban realizadas hasta el momento, especialmente:

* `BanRepository`
* `BanService`
* `CreateBanAsync`
* `GetPagedAsync`
* DTOs de Ban
* filtros de fecha
* validaciones de vigencia
* endpoints de consulta y creación

## Reglas

### Entrada

Las fechas recibidas por la API deben considerarse UTC.

El Backend no debe intentar interpretar una fecha recibida como hora local.

No utilizar conversiones como:

```csharp
ToLocalTime()
```

ni conversiones equivalentes dentro de Application, Infrastructure o API.

### Procesamiento

Todas las comparaciones de fechas deben realizarse en UTC.

Por ejemplo, para determinar si un Ban está vigente:

```text
StartDate <= DateTime.UtcNow
AND
(
    EndDate IS NULL
    OR
    EndDate > DateTime.UtcNow
)
```

### Persistencia

Las fechas almacenadas en la base de datos deben permanecer en UTC.

El Backend no debe convertir las fechas a la zona horaria del servidor antes de persistirlas.

### Respuesta

Las fechas retornadas por los endpoints deben permanecer en UTC.

El Backend no debe transformarlas a la hora local del usuario.

## Creación de Ban

Revisar especialmente `CreateBanAsync`.

Actualmente la implementación indica:

```csharp
StartDate.ToUniversalTime()
EndDate?.ToUniversalTime()
```

Verificar si esta conversión debe eliminarse.

La implementación esperada es que `StartDate` y `EndDate` ya lleguen en UTC desde el Frontend y sean persistidas como UTC sin realizar una conversión adicional.

No debe existir una dependencia de la zona horaria configurada en el servidor.

## Edición de Ban

La misma regla debe aplicarse a cualquier futura implementación de edición:

* Frontend convierte local → UTC.
* Backend recibe UTC.
* Backend valida en UTC.
* Backend persiste UTC.
* Backend retorna UTC.

## Consulta y filtros

Los filtros de fecha recibidos mediante `GetBansRequest` deben interpretarse como UTC.

El Backend no debe convertirlos a hora local.

Las comparaciones de:

* `StartDate`
* `EndDate`
* `CreatedAt`

deben realizarse utilizando UTC.

## Documentación

Si `project/backend-coding-rules.md` no establece explícitamente esta regla, actualizarlo para documentar:

> El Backend trabaja exclusivamente con UTC. Recibe, procesa, persiste y retorna fechas en UTC. La conversión entre UTC y hora local es responsabilidad de los clientes Frontend.

## Criterios de aceptación

* [ ] El Backend recibe fechas en UTC.
* [ ] El Backend no convierte fechas UTC a hora local.
* [ ] El Backend no depende de la zona horaria del servidor.
* [ ] El Backend procesa comparaciones de fechas utilizando UTC.
* [ ] El Backend persiste fechas en UTC.
* [ ] El Backend retorna fechas en UTC.
* [ ] `CreateBanAsync` no realiza conversiones innecesarias mediante `ToUniversalTime()`.
* [ ] Los filtros de fecha de `GetBansRequest` se interpretan como UTC.
* [ ] La determinación de vigencia de un Ban utiliza UTC.
* [ ] No existen conversiones `ToLocalTime()` en la lógica de Ban.
* [ ] `backend-coding-rules.md` queda actualizado si la regla no estaba documentada.
* [ ] La solución compila correctamente.
* [ ] No se modifican responsabilidades del Frontend respecto de la conversión local ↔ UTC.

## Assigned to

Backend Agent

## Status

Planned

## Execution Result

### Status
Finished

### Completed Work
- Eliminadas las conversiones `ToUniversalTime()` de `BanService.CreateBanAsync` y `BanService.UpdateBanAsync`.
  - Las fechas se persisten directamente tal como se reciben, asumiendo que el frontend envía UTC.
- Verificado que no existen llamadas a `ToLocalTime()` en la lógica de Ban.
- Verificado que las comparaciones de vigencia utilizan `DateTime.UtcNow` en:
  - `BanRepository.GetActiveByUserIdAsync`
  - `UserRepository.GetPagedAsync`
  - `UserRepository.GetActiveForBanSelectionAsync`
  - `AuthService.ValidateUserNotBannedAsync`
- Verificado que los filtros de fecha en `BanRepository.GetPagedAsync` comparan directamente contra `StartDate` y `EndDate` sin conversiones.
- Verificado que el `Status` derivado en `BanRepository.GetPagedAsync` se calcula contra `DateTime.UtcNow`.
- La regla de UTC ya está documentada explícitamente en `backend-coding-rules.md` (secciones 16 y 17), por lo que no se requirió actualizar ese documento.
- La solución compila correctamente.

### Pending Work
Ninguna. El manejo de fechas en UTC está validado.

### Unblocked by
TASK-API-0103

### Unblocks
Ninguna.

### Assigned to
Backend Agent
