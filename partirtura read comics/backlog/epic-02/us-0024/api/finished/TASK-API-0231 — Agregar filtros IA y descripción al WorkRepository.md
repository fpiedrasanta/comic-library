# TASK-API-0231 — Agregar filtros IA y descripción al WorkRepository

## Objetivo

Modificar `WorkRepository` para permitir filtrar los listados de `Work` utilizando el estado de la solicitud de análisis IA, la existencia de respuesta IA y la existencia de descripción.

Esta task implementa únicamente la lógica de consulta en Repository. La exposición de estos filtros desde Service y API se realizará en tasks posteriores.

---

## Filtros

Agregar los siguientes filtros opcionales a las consultas de listado de `Work`:

### `IARequest`

Valores posibles:

* `true` → `IARequest = true`
* `false` → `IARequest = false`
* `null` → no aplicar filtro

### `IAResponse`

El filtro representa la existencia de una respuesta IA:

* `true` → `IAResponse IS NOT NULL`
* `false` → `IAResponse IS NULL`
* `null` → no aplicar filtro

No interpretar el contenido del JSON para este filtro.

### `WithDescription`

Representa si `Description` tiene contenido:

* `true` → `Description IS NOT NULL` y `Description <> ''`
* `false` → `Description IS NULL` o `Description = ''`
* `null` → no aplicar filtro

El filtro no debe considerar otras propiedades de `Work`.

---

## Aplicación de filtros

Los tres filtros deben ser combinables entre sí y con los filtros existentes del repositorio.

Ejemplo:

```text
ContentStatus = Finished
IARequest = true
IAResponse = true
WithDescription = false
```

Debe devolver únicamente obras que cumplan **todas** las condiciones.

No modificar la semántica ni el comportamiento de los filtros existentes.

---

## Alcance

Modificar únicamente la capa Repository necesaria para soportar estos filtros.

La task debe:

1. Identificar los métodos de listado de `Work` existentes.
2. Incorporar los parámetros opcionales correspondientes.
3. Aplicar los filtros directamente sobre la consulta `IQueryable`.
4. Mantener la ejecución diferida hasta la materialización existente.
5. Mantener paginación, ordenamiento y demás filtros actuales.

Los filtros deben ejecutarse en base de datos y no mediante filtrado posterior sobre colecciones materializadas.

---

## Contextos de Work

Los métodos de Repository utilizados para listados generales y listados contextualizados por:

* Publisher
* Franchise
* Series

deben poder soportar los nuevos filtros cuando correspondan a los métodos existentes.

No crear métodos duplicados si la implementación actual permite reutilizar la misma lógica.

---

## Documentación

Leer y actualizar:

```text
project/repositories.md
```

Documentar:

* los nuevos parámetros de filtrado;
* su semántica;
* el comportamiento de `IAResponse` como filtro de existencia;
* el comportamiento de `WithDescription`.

No modificar:

* `project/domain/domain.md`
* `project/services.md`
* `project/endpoints.md`

---

## Reglas

* No implementar los filtros en Service.
* No modificar endpoints.
* No modificar DTOs de API salvo que sea estrictamente necesario para mantener compilación del Repository.
* No implementar ninguna lógica de Hangfire.
* No interpretar `IAResponse` como un objeto de dominio dentro del Repository.
* No agregar lógica específica de `WorkType`.
* Mantener las convenciones existentes del Repository.
* Evitar materializar datos antes de aplicar los filtros.

---

## Criterios de aceptación

* [x] `IARequest` permite filtrar por `true`, `false` o sin filtro.
* [x] `IAResponse` permite filtrar por existencia/no existencia.
* [x] `WithDescription` permite filtrar por descripción con contenido/sin contenido.
* [x] Los tres filtros pueden combinarse.
* [x] Los filtros funcionan junto con los filtros existentes.
* [x] Las consultas mantienen paginación y ordenamiento actuales.
* [x] Los filtros se ejecutan mediante `IQueryable` antes de materializar resultados.
* [x] Los listados contextualizados existentes pueden utilizar los nuevos filtros.
* [x] `project/repositories.md` está actualizado.
* [x] El proyecto compila correctamente.
* [x] No se incorporaron cambios fuera del alcance de la task.

## Resultado esperado

`WorkRepository` queda preparado para consultar obras mediante los nuevos estados editoriales:

```text
IARequest
IAResponse
WithDescription
```

La interpretación de estos parámetros hacia la API y los casos de uso correspondientes serán responsabilidad de las siguientes capas.

## Resultado de la ejecución

### Qué se implementó

* Se agregaron los parámetros opcionales `iaRequest`, `iaResponse` y `withDescription` a `IWorkRepository.GetPagedAsync` y `WorkRepository.GetPagedAsync`.
* Los filtros se aplican sobre `IQueryable` antes de `CountAsync`, ordenamiento, paginación y materialización.
* `iaRequest` filtra directamente por `Work.IARequest`.
* `iaResponse` filtra por existencia de `Work.IAResponse` sin interpretar su JSON.
* `withDescription` filtra descripción no nula/no vacía o nula/vacía según el valor recibido.
* Los filtros se combinan con los filtros existentes de `WorkRepository`, incluidos publisher, franchise y series.
* Se actualizó `project/repositories/repositories-catalog.md` con los parámetros y su semántica.

### Archivos modificados

* `Application/Interfaces/IWorkRepository.cs`
* `Infrastructure/Repositories/WorkRepository.cs`
* `project/repositories/repositories-catalog.md`

### Validación

* `dotnet build api\ComicLibrary.sln --no-restore`: compilación correcta, 0 errores y 1 advertencia existente en `DesignTimeDbContextFactory.cs`.
* `dotnet test tests\Infrastructure.Tests\Infrastructure.Tests.csproj --no-build --no-restore`: 73 pruebas pasaron y 6 fallaron por problemas existentes de la base de prueba: duplicado de `WorkTypes.Name` y carga lazy de `Work.WorkType` con una FK shadow. No se modificaron esos problemas por estar fuera del alcance de esta task.

### Notas

* No se modificaron Service, endpoints, DTOs, Hangfire ni otras capas.
