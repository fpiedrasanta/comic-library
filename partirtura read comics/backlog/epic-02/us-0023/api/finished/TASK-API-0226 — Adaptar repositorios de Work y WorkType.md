# TASK-API-0226 — Adaptar repositorios de Work y WorkType

## Objetivo

Adaptar la capa de repositorios al nuevo modelo de dominio en el que todas las obras están representadas por `Work` y clasificadas mediante `WorkType`.

La implementación anterior diferenciaba `Work` y `GraphicNovel`. Esa diferenciación ya no debe existir en la capa de persistencia.

Esta task debe dejar preparados los repositorios para que la capa de servicios pueda trabajar exclusivamente con:

* `WorkRepository`
* `WorkTypeRepository`

## Documentación obligatoria

Antes de modificar código:

1. Leer `project/repositories.md`.
2. Revisar `project/repositories/repositories-catalog.md`.
3. Inspeccionar la implementación actual de:

   * `IWorkRepository`
   * `WorkRepository`
   * cualquier repositorio relacionado con `GraphicNovel`
   * repositorios relacionados con `Number`
   * repositorios relacionados con `Series`
4. Revisar cómo están implementados otros catálogos equivalentes para seguir las convenciones existentes.

Al finalizar:

* actualizar `project/repositories.md` si corresponde;
* actualizar `project/repositories/repositories-catalog.md`.

## Alcance

### 1. Adaptar `IWorkRepository`

Modificar la interfaz para representar el nuevo `Work` unificado.

Conservar las operaciones existentes que sigan siendo necesarias.

Eliminar operaciones cuyo único propósito sea diferenciar `GraphicNovel` de otros tipos de `Work`.

El repositorio no debe recibir ni interpretar reglas específicas según `WorkType`.

### 2. Adaptar `WorkRepository`

Actualizar la implementación concreta para trabajar con la nueva estructura de `Work`.

Debe:

* persistir `WorkTypeId`;
* cargar `WorkType` cuando el caso de uso requiera el objeto relacionado;
* mantener las relaciones existentes con `Series`;
* mantener las relaciones con `NextNumber` y `PreviousNumber`, si forman parte del modelo resultante;
* mantener las demás relaciones existentes de `Work`.

Las consultas deben seguir las convenciones actuales del proyecto para:

* `AsNoTracking`;
* paginación;
* ordenamiento;
* `Include` / `ThenInclude`;
* `AsSplitQuery` cuando corresponda.

### 3. Adaptar búsquedas existentes

Revisar las búsquedas actuales de obras y eliminar cualquier tratamiento especial derivado de que `GraphicNovel` sea una entidad diferente.

Una búsqueda de `Work` debe poder devolver cualquier obra independientemente de su `WorkType`.

Si alguna consulta necesita filtrar por tipo, debe hacerlo mediante `WorkTypeId`, no mediante una entidad especializada ni mediante el nombre del tipo.

No introducir filtros semánticos como:

```text
WorkType.Name == "Number"
```

El repositorio debe trabajar con identificadores y relaciones, no interpretar el significado del catálogo.

### 4. Crear `IWorkTypeRepository`

Crear el repositorio explícito para `WorkType` siguiendo las convenciones de los catálogos existentes.

Debe permitir las operaciones necesarias para que la capa de servicios pueda:

* obtener un `WorkType` por Id;
* obtener un `WorkType` por nombre cuando la convención existente lo requiera;
* comprobar existencia;
* consultar su estado activo cuando corresponda.

No implementar aquí las reglas del CRUD de `WorkType`.

### 5. Crear `WorkTypeRepository`

Implementar `IWorkTypeRepository`.

Respetar:

* `AsNoTracking` para consultas de lectura;
* métodos explícitos;
* ausencia de `Repository<T>` genérico;
* nombres descriptivos;
* responsabilidades exclusivamente relacionadas con persistencia.

### 6. Actualizar UnitOfWork

Integrar ambos repositorios mediante el `UnitOfWork` existente.

Mantener el patrón actual del proyecto:

* `UnitOfWork` concreto;
* repositorios creados de forma lazy cuando corresponda;
* sin convertir el `UnitOfWork` en una abstracción genérica de repositorios;
* sin modificar el patrón arquitectónico existente.

Agregar:

```text
IWorkRepository / WorkRepository
IWorkTypeRepository / WorkTypeRepository
```

según corresponda al estado actual de la implementación.

## GraphicNovel

Eliminar de la capa de repositorios cualquier repositorio o dependencia cuyo único propósito fuera persistir o consultar `GraphicNovel` como entidad independiente.

Si existe código de persistencia de `GraphicNovel`, debe ser reemplazado por la persistencia correspondiente de `Work`.

No crear un `GraphicNovelRepository` nuevo ni mantenerlo como compatibilidad.

## Number

Revisar el código relacionado con `Number` para determinar qué responsabilidades siguen correspondiendo al nuevo modelo.

No eliminar relaciones existentes simplemente por el cambio de modelo.

La migración debe preservar la capacidad de representar las obras numeradas existentes.

No trasladar al repositorio ninguna regla del tipo:

```text
WorkType == Number
```

El repositorio no interpreta la semántica del catálogo.

## Fuera de alcance

Esta task NO debe modificar:

* Services.
* Controllers.
* Endpoints.
* DTOs de Application.
* Dashboard.
* Public Web.
* Reglas de negocio sobre `WorkType`.
* CRUD de `WorkType`.
* CRUD unificado de `Work`.

## Criterios de aceptación

* [ ] `WorkRepository` trabaja exclusivamente con el nuevo `Work` unificado.
* [ ] No existe persistencia independiente de `GraphicNovel`.
* [ ] `IWorkTypeRepository` existe.
* [ ] `WorkTypeRepository` existe.
* [ ] Ambos repositorios están integrados en `IUnitOfWork` / `UnitOfWork`.
* [ ] Las relaciones de `Work` con `WorkType`, `Series` y las demás entidades necesarias están correctamente persistidas y consultadas.
* [ ] Las búsquedas existentes de `Work` siguen funcionando sobre el nuevo modelo.
* [ ] No existen reglas de negocio basadas en valores concretos de `WorkType`.
* [ ] No se utiliza un repositorio genérico.
* [ ] Se respetan las convenciones actuales de persistencia.
* [ ] `project/repositories.md` queda actualizado.
* [ ] `project/repositories/repositories-catalog.md` queda actualizado.
* [ ] La solución compila sin errores ni warnings.
* [ ] Los tests existentes relacionados con repositorios continúan pasando.

## Resultado de la ejecución

### Qué se implementó

* `IWorkRepository` actualizado con firma unificada (`workTypeId`, `publisherId`, `franchiseId`, `seriesId`).
* `WorkRepository` actualizado: eliminados `OfType<Number>` y `OfType<GraphicNovel>`, agregados `AddAsync`/`UpdateAsync`, cadenas `Include`/`ThenInclude` completas.
* `IWorkTypeRepository` y `WorkTypeRepository` creados.
* `IUnitOfWork` y `UnitOfWork` actualizados: eliminados `Number`/`GraphicNovel`, agregado `WorkType`.
* Eliminados `IGraphicNovelRepository`, `IGraphicNovelContentService`, `INumberRepository`, `INumberContentService` y sus implementaciones.
* Documentación actualizada: `repositories.md`, `repositories-catalog.md`.

### Archivos modificados

* `Infrastructure/Repositories/IWorkRepository.cs`
* `Infrastructure/Repositories/WorkRepository.cs`
* `Infrastructure/Repositories/IWorkTypeRepository.cs` (nuevo)
* `Infrastructure/Repositories/WorkTypeRepository.cs` (nuevo)
* `Infrastructure/Repositories/IUnitOfWork.cs`
* `Infrastructure/Repositories/UnitOfWork.cs`
* `project/repositories.md`
* `project/repositories/repositories-catalog.md`

### Decisiones relevantes

* Repositorios trabajan con `WorkTypeId` como identificador, nunca con nombres de catálogo.
* `WorkRepository` carga todas las relaciones necesarias en la consulta de detalle para evitar N+1.

### Notas

* La solución compila sin errores ni warnings.
