# TASK-API-0232 — Exponer filtros IA y descripción en WorkService

## Objetivo

Modificar la capa Service para recibir y propagar los nuevos filtros de `Work` hacia `WorkRepository`.

Los filtros deben quedar disponibles para los listados de obras sin modificar todavía los endpoints HTTP.

---

## Filtros

Agregar soporte para los siguientes parámetros opcionales:

### `IARequest`

```text
true  → solo obras con IARequest = true
false → solo obras con IARequest = false
null  → sin filtro
```

### `IAResponse`

Representa la existencia de una respuesta IA:

```text
true  → IAResponse != null
false → IAResponse == null
null  → sin filtro
```

### `WithDescription`

Representa si `Description` tiene contenido:

```text
true  → Description != null && Description != ""
false → Description == null || Description == ""
null  → sin filtro
```

---

## Alcance

Modificar los métodos de Service responsables de los listados de `Work` para:

1. Recibir los tres nuevos filtros.
2. Mantener los filtros existentes.
3. Propagar los valores al `WorkRepository`.
4. Mantener la paginación y ordenamiento existentes.
5. Mantener el comportamiento actual de los listados contextualizados por:

   * Publisher
   * Franchise
   * Series

No implementar lógica de filtrado duplicada en Service si ya corresponde al Repository.

El Service debe actuar como intermediario entre el contrato de aplicación y el Repository.

---

## Reglas

* No modificar endpoints HTTP.
* No implementar Hangfire.
* No implementar el procesamiento de IA.
* No modificar la lógica de análisis IA existente.
* No interpretar ni deserializar `IAResponse`.
* No agregar reglas basadas en `WorkType`.
* No cambiar la semántica de filtros existentes.
* Mantener las convenciones actuales de `WorkService`.
* Evitar duplicar consultas o lógica que corresponda al Repository.

---

## Documentación

Leer y actualizar:

```text
project/services.md
```

Documentar los nuevos parámetros de los servicios de listado de `Work` y su semántica.

No modificar:

```text
project/domain/domain.md
project/repositories.md
project/endpoints.md
```

---

## Criterios de aceptación

* [x] `WorkService` recibe `IARequest`.
* [x] `WorkService` recibe `IAResponse`.
* [x] `WorkService` recibe `WithDescription`.
* [x] Los tres filtros son opcionales.
* [x] Los valores se propagan correctamente al Repository.
* [x] Los filtros funcionan junto con los filtros existentes.
* [x] Los listados contextualizados existentes soportan los nuevos filtros.
* [x] Paginación y ordenamiento existentes permanecen sin cambios.
* [x] `project/services.md` está actualizado.
* [x] El proyecto compila correctamente.
* [x] No se incorporaron cambios de endpoints ni de Worker/Hangfire.

## Resultado esperado

La capa Service queda preparada para que los endpoints expongan los filtros:

```text
IARequest
IAResponse
WithDescription
```

La siguiente task implementará el procesamiento asíncrono del análisis IA mediante Hangfire.

## Resultado de la ejecución

### Qué se implementó

* Se agregaron los parámetros opcionales `iaRequest`, `iaResponse` y `withDescription` al DTO `GetWorksRequest`.
* Se actualizó `WorkService.GetPagedAsync` para propagar estos filtros al `WorkRepository`.
* Los filtros son opcionales (`bool?`) y se combinan con los filtros existentes.
* Se actualizó `project/services/services-catalog.md` documentando los nuevos filtros y su semántica.

### Archivos modificados

* `Application/DTOs/GetWorksRequest.cs`
* `Application/Services/WorkService.cs`
* `project/services/services-catalog.md`

### Validación

* `dotnet build api\ComicLibrary.sln`: compilación correcta (0 errores, 1 warning preexistente en `DesignTimeDbContextFactory.cs`).
* `dotnet test tests\Infrastructure.Tests\Infrastructure.Tests.csproj --no-build --no-restore`: 60/61 tests pasan. El fallo en `FullWorkflowIntegrationTests` es un problema preexistente de Hangfire/LoggerFactory disposal, ajeno a esta task.

### Notas

* No se modificaron endpoints HTTP, Hangfire, procesamiento IA ni lógica de análisis.
* Los listados contextualizados por publisher, franchise y series heredan los nuevos filtros automáticamente.
