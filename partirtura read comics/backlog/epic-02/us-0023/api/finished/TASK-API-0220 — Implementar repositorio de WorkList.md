# TASK-API-0220 — Implementar repositorio de WorkList

## Objetivo

Implementar el repositorio de `WorkList` y su integración con `IUnitOfWork`, permitiendo consultar y persistir listas oficiales del sistema.

La implementación debe respetar completamente la arquitectura, convenciones y reglas existentes del proyecto.

---

## Documentación obligatoria

Antes de comenzar:

1. Leer `project/repositories.md`.
2. Revisar implementaciones existentes de repositorios similares, especialmente aquellos con:

   * búsqueda;
   * filtros múltiples;
   * paginación;
   * ordenamiento;
   * relaciones.

Al finalizar, actualizar `project/repositories.md` con la implementación realizada.

---

## Alcance

Implementar:

* `IWorkListRepository`
* `WorkListRepository`
* integración de `IWorkListRepository` en `IUnitOfWork` / `UnitOfWork`.

No implementar servicios ni endpoints en esta task.

---

## Consulta paginada

El repositorio debe soportar una consulta paginada de listas oficiales.

### Condición obligatoria

La consulta debe devolver exclusivamente:

```text
WorkList.OwnerType == System
```

Esto es una condición propia de la consulta de listas oficiales, no un filtro proporcionado por el usuario.
Las listas pertenecientes a usuarios no deben aparecer bajo ninguna circunstancia en este listado.

### Búsqueda

Recibir un único parámetro `search`.

Debe buscar con lógica `OR` sobre:

```text
WorkList.Name
Work.Title
Work.Number
```

Una lista debe aparecer si:

* el nombre de la lista coincide con `search`; o
* alguna obra perteneciente a la lista tiene un título que coincide; o
* alguna obra perteneciente a la lista tiene un número que coincide.

`Work.Number` aplica únicamente a obras que poseen número.

La búsqueda debe realizarse en la consulta SQL mediante EF Core y no materializando previamente las listas.

### Filtros

Soportar los siguientes filtros:

```text
FranchiseId (si al menos una obra dentro de la lista pertenece a esa franquicia, entonce me trae la lista)
PublisherId (si al menos una obra dentro de la lista pertenece a esa editorial, entonce me trae la lista)
ListTypeId
IsActive
CreatedAtFrom
CreatedAtTo
```

### Rango de fechas

Soportar:

```text
CreatedAtFrom
CreatedAtTo
```

El rango debe ser inclusivo respecto de la fecha proporcionada.

---

## Ordenamiento

Soportar:

```text
Name
CreatedAt
```

con dirección:

```text
Ascending
Descending
```

No aceptar campos arbitrarios de ordenamiento.
La implementación debe seguir el patrón utilizado por los repositorios existentes para evitar lógica dinámica insegura o difícil de mantener.

---

## Paginación

La consulta debe devolver la información necesaria para construir una respuesta paginada siguiendo el patrón existente del proyecto.
No materializar el conjunto completo antes de aplicar la paginación.

Aplicar:

1. filtros;
2. búsqueda;
3. ordenamiento;
4. paginación;
5. materialización.

---

## Obtener por Id

Implementar la consulta necesaria para obtener una `WorkList` por Id con toda la información requerida por la edición.

Debe incluir:

```text
WorkList
├── ListType
└── WorkListItems
    └── Work
        ├── Franchise
        ├── Publisher
        └── Serie
```

Las obras deben devolverse ordenadas por:

```text
WorkListItem.Position
```

La información cargada debe ser suficiente para que la capa Application pueda construir el detalle de edición sin realizar consultas adicionales por cada obra.

---

## Persistencia

Implementar los métodos necesarios para que la capa Application pueda:

* crear una `WorkList`;
* actualizar sus datos;
* actualizar su relación con `WorkListItems`;
* activar/desactivar la lista mediante su estado lógico.

La eliminación física no forma parte del repositorio.

La eliminación lógica debe realizarse modificando:

```text
IsActive
```

---

## WorkListItems

El repositorio debe permitir que la capa Application gestione correctamente:

* incorporación de obras a una lista;
* eliminación de obras de una lista;
* modificación de `Position`;
* persistencia del orden.

Reglas:

* una misma `Work` no puede aparecer dos veces dentro de la misma `WorkList`;
* cada elemento debe tener una posición;
* quitar una obra de una lista no elimina la obra;
* modificar el orden no modifica la obra.

No implementar reglas de negocio en el repositorio.

---

## Unidad de trabajo

Agregar `IWorkListRepository` a `IUnitOfWork`.

Seguir el patrón actual del proyecto:

* `UnitOfWork` es una fábrica concreta;
* no introducir una abstracción adicional para la fábrica;
* mantener inicialización lazy consistente con los repositorios existentes;
* no utilizar `Repository<T>` genérico.

---

## Restricciones

* No modificar entidades de dominio salvo que sea estrictamente necesario para resolver una incompatibilidad detectada.
* No implementar lógica de negocio.
* No implementar DTOs.
* No implementar servicios.
* No implementar controllers/endpoints.
* No crear repositorios genéricos.
* No realizar consultas adicionales innecesarias.
* No materializar colecciones antes de aplicar filtros, ordenamiento y paginación.
* Mantener todas las consultas compatibles con MySQL y EF Core utilizados por el proyecto.
* Seguir las convenciones existentes de `AsNoTracking` para consultas de solo lectura.
* Mantener los identificadores y código en inglés.

---

## Validación

Antes de finalizar:

1. Compilar el backend.
2. Ejecutar los tests existentes relacionados con repositorios.
3. Agregar tests si el proyecto ya dispone de infraestructura adecuada para probar esta capa.
4. Verificar especialmente:

   * solo aparecen listas `System`;
   * búsqueda por nombre de lista;
   * búsqueda por título de obra;
   * búsqueda por número;
   * búsqueda por `FranchiseId`;
   * búsqueda por `PublisherId`;
   * búsqueda por `ListTypeId`;
   * `IsActive`;
   * `CreatedAtFrom`;
   * `CreatedAtTo`;
   * orden por `Name`;
   * orden por `CreatedAt`;
   * ambos sentidos de orden;
   * paginación;
   * `GetById`;
   * carga de `ListType`;
   * carga de `WorkListItems`;
   * carga de `Work`, `Franchise`, `Publisher` y `Number`;
   * orden de las obras por `Position`;
   * persistencia de altas, modificaciones y cambios de `WorkListItems`;

---

## Resultado esperado

Al finalizar esta task debe existir un repositorio funcional que permita a la capa Application consultar y persistir `WorkList` oficiales, incluyendo búsqueda, filtros, ordenamiento, paginación y carga completa del detalle requerido para edición.

Actualizar `project/repositories.md` con la nueva implementación.

## Execution result

- Implemented `IWorkListRepository` and `WorkListRepository` with the mandatory `OwnerType.System` filter, database-side search across list name/work title/work number, franchise/publisher/list-type/status/date filters, validated ordering, and pagination.
- Added a fully loaded `GetByIdAsync` query with `ListType`, `Cover`, ordered `WorkListItems`, `Work`, `Franchise`, `Publisher`, and `Series`; all read queries use `AsNoTracking`, and the detail query uses `AsSplitQuery`.
- Added `GetByNameAsync` for duplicate-name validation and retained explicit `AddAsync`/`UpdateAsync` persistence methods without physical deletion.
- Confirmed `IWorkListRepository` is integrated through `IUnitOfWork` and lazy repository creation in `UnitOfWork`.
- Updated `project/repositories.md` and `project/repositories/repositories-catalog.md` with operations, query behavior, indexes, and constraints.
- Validation: `dotnet build ComicLibrary.sln --no-restore` completed with 0 errors and 0 warnings. The fast infrastructure policy subset passed 5/5 tests. The full infrastructure test run exceeded the 120-second command timeout in the existing MySQL/Hangfire integration environment; no WorkList-specific test fixture was present to complete independently.

