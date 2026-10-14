# TASK-API-0235 — Agregar filtros IA a los listados de Work

## Objetivo

Modificar los endpoints de listado de `Work` para exponer los nuevos filtros de estado de análisis IA y descripción implementados en Repository y Service.

Los cuatro endpoints deben ofrecer exactamente los mismos filtros:

* `iaRequest`
* `iaResponse`
* `withDescription`

---

## Endpoints

Modificar:

```text
GET /api/admin-works
GET /api/admin-works/publisher/{id}
GET /api/admin-works/franchise/{id}
GET /api/admin-works/series/{id}
```

Agregar los siguientes query parameters opcionales:

```text
iaRequest
iaResponse
withDescription
```

Los tres parámetros deben aceptar:

```text
true
false
ausente
```

Cuando el parámetro está ausente, no debe aplicarse ningún filtro.

---

## Semántica

### `iaRequest`

```text
true  → IARequest = true
false → IARequest = false
```

### `iaResponse`

Representa la existencia de una respuesta IA:

```text
true  → IAResponse IS NOT NULL
false → IAResponse IS NULL
```

No interpretar ni deserializar el contenido de `IAResponse` para realizar este filtro.

### `withDescription`

Representa si la obra tiene una descripción:

```text
true  → Description IS NOT NULL && Description != ""
false → Description IS NULL || Description = ""
```

---

## Combinación

Los filtros deben combinarse mediante AND con:

* los filtros IA entre sí;
* `withDescription`;
* `ContentStatus`;
* filtros existentes;
* contexto de Publisher, Franchise o Series;
* paginación;
* ordenamiento.

Ejemplo:

```text
GET /api/admin-works?contentStatus=Finished&iaRequest=true&iaResponse=true&withDescription=false
```

Debe devolver únicamente las obras que cumplan todas las condiciones.

---

## Listados contextualizados

Los endpoints:

```text
/api/admin-works/publisher/{id}
/api/admin-works/franchise/{id}
/api/admin-works/series/{id}
```

deben aplicar los nuevos filtros además de su filtro contextual existente.

No alterar el significado del contexto.

---

## DTO de listado

El resultado de los listados debe permitir al cliente conocer el estado de IA necesario para representar la información en el grid.

Si el DTO de listado actualmente no expone estos datos, agregar:

```text
iaRequest
iaResponse
```

donde `iaResponse` represente únicamente si existe una respuesta, no el contenido completo de `IAResponse`.

No devolver el JSON completo de `IAResponse` en los listados.

La respuesta detallada de `IAResponse` será responsabilidad de `TASK-API-0236`.

---

## Documentación

Leer y actualizar:

```text id="z9n1xf"
project/endpoints.md
```

Documentar los tres query parameters en los cuatro endpoints y su semántica.

Documentar también los campos de estado IA incluidos en el DTO de listado, si son incorporados.

No modificar:

```text id="8nkj2p"
project/domain/domain.md
project/repositories.md
project/services.md
```

---

## Reglas

* Reutilizar los filtros implementados en Repository y Service.
* No duplicar lógica de filtrado en Controllers.
* No implementar consultas nuevas directamente en los endpoints.
* No devolver `IAResponse` completo en un listado.
* No modificar el comportamiento de los filtros existentes.
* Mantener paginación y ordenamiento actuales.
* Mantener las rutas existentes.
* Mantener los contratos existentes salvo la incorporación de los nuevos parámetros/campos necesarios.
* No implementar lógica de Hangfire.

---

## Criterios de aceptación

* [x] `/api/admin-works` acepta `iaRequest`.
* [x] `/api/admin-works` acepta `iaResponse`.
* [x] `/api/admin-works` acepta `withDescription`.
* [x] `/api/admin-works/publisher/{id}` acepta los tres filtros.
* [x] `/api/admin-works/franchise/{id}` acepta los tres filtros.
* [x] `/api/admin-works/series/{id}` acepta los tres filtros.
* [x] Los filtros pueden combinarse entre sí.
* [x] Los filtros funcionan junto con `ContentStatus` y los filtros existentes.
* [x] `iaResponse=true` filtra por existencia de respuesta.
* [x] `iaResponse=false` filtra por ausencia de respuesta.
* [x] `withDescription=true` excluye descripciones `null` y vacías.
* [x] `withDescription=false` incluye descripciones `null` o vacías.
* [x] Los listados no devuelven el JSON completo de `IAResponse`.
* [x] El DTO de listado expone el estado necesario de `IARequest` y existencia de `IAResponse`, si corresponde.
* [x] `project/endpoints.md` está actualizado.
* [x] El proyecto compila correctamente.
* [x] No se incorporaron cambios fuera del alcance de la task.

## Resultado esperado

Los cuatro listados permiten utilizar `Work` como una cola editorial para identificar rápidamente el estado del procesamiento IA.

Ejemplos:

```text id="0tqf7j"
ContentStatus = Finished
IARequest = false
→ Obras procesadas que todavía no fueron enviadas a IA.
```

```text id="q5h8ks"
ContentStatus = Finished
IARequest = true
IAResponse = true
WithDescription = false
→ Obras analizadas por IA que todavía no tienen descripción.
```

```text id="4k7w9s"
ContentStatus = Finished
IARequest = true
IAResponse = true
WithDescription = true
→ Obras procesadas, analizadas por IA y con descripción.
```

## Resultado de la ejecución

### Qué se implementó

* **`WorkListItemDto`** — agregados campos `IARequest` (bool) y `HasIAResponse` (bool) para exponer estado IA en listados.
* **`GetWorksRequest`** — ya tenía los parámetros `iaRequest`, `iaResponse`, `withDescription` (bool?) agregados en TASK-API-0232.
* **Endpoints de listado** (`GET /api/admin-works`, `/publisher/{id}`, `/franchise/{id}`, `/series/{id}`):
  - Aceptan los tres query parameters opcionales: `iaRequest`, `iaResponse`, `withDescription`
  - Valores: `true`, `false`, ausente (sin filtro)
  - Se combinan con AND entre sí y con filtros existentes
  - Funcionan en listados contextualizados (publisher, franchise, series)
* **Documentación** en `project/endpoints/endpoints-works.md`:
  - Parámetros documentados en los 4 endpoints
  - Ejemplo de respuesta actualizado con `iaRequest` y `hasIAResponse`

### Archivos modificados

* `Application/DTOs/WorkListItemDto.cs` — nuevos campos `IARequest`, `HasIAResponse`
* `Application/Services/WorkService.cs` — `MapWork` incluye nuevos campos
* `project/endpoints/endpoints-works.md` — documentación completa

### Validación

* `dotnet build api\ComicLibrary.sln`: compilación correcta (0 errores, 0 warnings)
* `dotnet test tests\Infrastructure.Tests\Infrastructure.Tests.csproj --no-build --no-restore`: **79/79 tests pasan**

### Notas

* Los filtros se reutilizan de Repository/Service (TASK-API-0231/0232), sin duplicar lógica en Controllers
* `iaResponse` en listados = booleano de existencia (`HasIAResponse`), no JSON completo
* El JSON completo de `IAResponse` se entregará en TASK-API-0236 (detalle)
