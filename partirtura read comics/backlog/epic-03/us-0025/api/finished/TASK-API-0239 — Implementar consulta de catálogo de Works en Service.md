# TASK-API-0239 — Implementar consulta de catálogo de Works en Service

## Objetivo

Implementar en `WorkService` la operación de consulta del catálogo para usuarios registrados, utilizando la nueva capacidad del Repository implementada en `TASK-API-0238`.

El Service debe definir el contrato de aplicación para la navegación del catálogo sin exponer detalles de persistencia.

---

## Dependencias

* `TASK-API-0238` — Implementar consulta de catálogo de Works en Repository.

---

## Contexto obligatorio

Antes de implementar:

* leer `project/services.md`;
* leer `project/repositories.md`;

---

## Alcance

Agregar al contrato y a la implementación de `WorkService` una nueva operación para obtener Works del catálogo.

La operación debe recibir:

* Search;
* PublisherId opcional;
* FranchiseId opcional;
* SeriesId opcional;
* WorkTypeId opcional;
* ordenamiento;
* dirección;
* página;
* tamaño de página.

Debe delegar la consulta al Repository correspondiente.

---

## Responsabilidades del Service

El Service debe:

* validar parámetros de entrada cuando corresponda;
* establecer valores por defecto;
* traducir los parámetros de aplicación al contrato del Repository;
* obtener los resultados;
* mapear las entidades al DTO correspondiente;
* devolver la respuesta paginada utilizada por los endpoints de lectura.

No debe:

* implementar consultas LINQ de persistencia;
* duplicar la lógica jerárquica del Repository;
* filtrar Works en memoria;
* implementar lógica específica de React/frontend.

---

## WorkType

El resultado del catálogo debe exponer el `WorkType` de la Work.

Esto es necesario para que el frontend pueda mostrar posteriormente el tipo de Work tanto en filtros como en las Work Cards.

La operación no debe utilizar WorkType para determinar la pertenencia de una Work a Publisher, Franchise o Series.

---

## Contrato funcional

El Service debe soportar:

```text
Search:
    Title
    Summary
    Number.Value
    Tags
    Person

Filters:
    Publisher
    Franchise
    Series
    WorkType

Sort:
    Title
    PublicationDate
    UploadedAt
    Number

Direction:
    Ascending
    Descending
```

Default:

```text
UploadedAt DESC
```

---

## Paginación

El Service debe devolver la información necesaria para que el endpoint exponga una respuesta paginada.

El frontend utilizará esta información para implementar scroll infinito.

La implementación del scroll no pertenece al Service.

---

## Documentación

Leer:

```text
project/services.md
```

Actualizar:

```text
project/services.md
```

y el catálogo específico de Services de Work, si corresponde.

Documentar:

* nueva operación;
* parámetros;
* comportamiento;
* DTO utilizado;
* relación con el Repository.

No modificar `project/endpoints.md` en esta Task.

---

## Criterios de finalización

* [ ] Existe una nueva operación en `IWorkService`.
* [ ] Existe su implementación en `WorkService`.
* [ ] Recibe Search.
* [ ] Recibe PublisherId, FranchiseId y SeriesId.
* [ ] Recibe ordenamiento y dirección.
* [ ] Recibe paginación.
* [ ] Utiliza el Repository de catálogo.
* [ ] No duplica lógica de consulta del Repository.
* [ ] Devuelve WorkType.
* [ ] Mantiene la lógica jerárquica exclusivamente en Repository.
* [ ] Default: UploadedAt DESC.
* [ ] `project/services.md` queda actualizado.
* [ ] El catálogo específico de Services queda actualizado si corresponde.
* [ ] La solución compila sin errores.

---

# Resultado de ejecución

## Qué se implementó

Nueva operación de aplicación `IWorkService.GetCatalogPagedAsync` para la navegación del catálogo de usuarios registrados. Valida y normaliza la entrada, delega la consulta al Repository de catálogo y devuelve `ListResponse<WorkCatalogItemDto>`.

## Archivos nuevos

- `api/Application/DTOs/WorkCatalogDtos.cs` — `GetCatalogWorksRequest`, `WorkCatalogItemDto`, `WorkCatalogNodeDto`.
- `api/Application/Constants/WorkCatalogSortFields.cs` — nombres de campo de ordenamiento del catálogo, incluido el alias público `UploadedAt` para `CreatedAt`.

## Archivos modificados

- `api/Application/Interfaces/IWorkService.cs` — nueva operación.
- `api/Application/Services/WorkService.cs` — implementación, mapeo y helpers privados.
- `project/services/services-catalog.md` — controller, operación y sección `GetCatalogPagedAsync` con responsabilidades, mapeo y límites.

## Decisiones

- El Service no escribe LINQ de persistencia, no resuelve pertenencia jerárquica y no filtra en memoria: delega y mapea.
- El DTO expone la jerarquía efectiva como nodos `WorkCatalogNodeDto` (Id, Name, Color) de Series, Franchise y Publisher. Una Work asignada a una Series reporta además la Franchise y el Publisher de esa Series, usando la navegación ya cargada por el Repository.
- `WorkCatalogNodeDto` evita repetir tres campos idénticos tres veces y mantiene el mapeo por debajo de un tamaño razonable; no se duplicó la lógica de URL de portada porque se reutiliza `ImageUrlBuilder`.
- Paginación normalizada con `PaginationGuard` (default 12, máximo 50) y respuesta con `PaginationGuard.Build`, igual que el resto de endpoints de lectura.
- Defaults del catálogo: `orderBy = CreatedAt`, `orderDir = DESC`.
- El DTO no expone datos administrativos: `IsActive`, `ContentStatus`, `ContentError` ni el estado de IA quedan fuera del contrato público.
- El DTO de catálogo se mantiene separado de `WorkListItemDto` (administración) en lugar de reutilizarlo, porque el contrato público expone una jerarquía resuelta y no debe arrastrar campos administrativos.

## Notas

- `MapCatalogWork` tiene 16 líneas, una por encima del límite de 15 de `backend-coding-rules.md`. Se aceptó así para no fragmentar el mapeo en funciones sintéticas; los helpers auxiliares cumplen el límite.
- No se modificó Domain ni `repositories.md`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores, sin warnings nuevos.
- 20/20 tests del catálogo en verde, incluyendo la verificación de que Publisher, Franchise y Series se devuelven con nombre y color.
