# TASK-API-0225 — Unificar Work y GraphicNovel en el dominio

## Objetivo

Rediseñar el dominio para representar todas las obras mediante una única entidad `Work`, utilizando `WorkType` como clasificación de la obra.

La implementación actual diferencia `Work` y `GraphicNovel`. Esa diferenciación debe eliminarse del modelo de dominio.

El nuevo modelo debe permitir representar:

* Obras numeradas.
* Novelas gráficas.
* Obras especiales.
* Crossovers u otras obras independientes.
* Cualquier nuevo tipo de obra que pueda agregarse posteriormente mediante el CRUD de `WorkType`.

`WorkType` es una **entidad de catálogo** administrable mediante CRUD. Su valor únicamente clasifica la obra y **no determina reglas estructurales ni validaciones específicas sobre `Work`**.

## Documentación obligatoria

Antes de modificar código:

1. Leer `project/domain/domain-catalog.md`.
2. Revisar la documentación de dominio relacionada con:

   * `Work`
   * `GraphicNovel`
   * `Number`
   * `Series`
   * relaciones entre obras.
3. Inspeccionar la implementación actual de estas entidades y sus relaciones.

Al finalizar, actualizar `project/domain/domain-catalog.md` con el modelo resultante.

## Alcance

### 1. Crear `WorkType`

Crear la entidad de dominio:

```text
WorkType
├── Id
├── Name
├── IsActive
└── CreatedAt
```

`WorkType` debe seguir las convenciones existentes para entidades de catálogo del proyecto.

No implementar CRUD, repositorios, servicios ni endpoints en esta task.

### 2. Unificar `Work`

Modificar `Work` para que represente directamente cualquier tipo de obra.

El modelo debe incorporar la clasificación:

```text
Work
├── WorkTypeId
├── SeriesId?
├── Number?
├── NextNumberId?
├── PreviousNumberId?
└── ...
```

Los nombres exactos y tipos deben respetar las convenciones y entidades existentes.

Los datos actualmente específicos de `GraphicNovel` que deban formar parte de una obra deben quedar integrados en `Work`.

### 3. Eliminar la especialización `GraphicNovel`

Eliminar del dominio la necesidad de una entidad especializada `GraphicNovel`.

Una Graphic Novel pasa a ser simplemente:

```text
Work
└── WorkType = Graphic Novel
```

No debe existir herencia ni una entidad paralela para representar este caso.

Si la implementación actual posee propiedades, relaciones o claves específicas de `GraphicNovel`, migrarlas conceptualmente al nuevo modelo `Work` cuando correspondan.

### 4. Relaciones con Series y Numbers

Mantener en `Work` las relaciones necesarias para representar las obras numeradas actuales.

En particular, conservar las relaciones existentes equivalentes a:

```text
SeriesId?
NextNumberId?
PreviousNumberId?
```

Estas propiedades deben ser nullable cuando corresponda.

La existencia de un `WorkType` **no debe utilizarse para determinar si estas propiedades son obligatorias, opcionales o nulas**.

Por ejemplo, el dominio no debe contener reglas como:

```text
if WorkType == "Number"
    SeriesId is required
```

ni equivalentes.

`WorkType` es únicamente clasificación.

### 5. Integridad del dominio

Mantener solamente las restricciones estructurales que correspondan al dominio y a las relaciones entre entidades.

Validar conceptualmente:

* `WorkTypeId` representa una relación con `WorkType`.
* Las relaciones opcionales de `Work` deben poder ser nulas.
* Las relaciones existentes con `Series` y otras entidades deben conservar su integridad.
* No introducir reglas basadas en el nombre o significado de `WorkType`.

No agregar validaciones semánticas del tipo de obra.

## Migración

Si el cambio de dominio requiere una migración:

* Crear la migración correspondiente.
* No eliminar datos existentes sin una estrategia explícita de migración.
* Preservar las obras actuales.
* Migrar la información existente de `GraphicNovel` hacia `Work` cuando corresponda.
* Mantener las relaciones existentes que continúen siendo válidas.

La migración debe ser consistente con el nuevo modelo y permitir que la base existente pueda evolucionar hacia la nueva estructura.

## Fuera de alcance

Esta task **NO debe modificar**:

* Repositories.
* Services.
* Controllers.
* Endpoints.
* DTOs de aplicación.
* Dashboard.
* Public Web.
* CRUD de `WorkType`.
* CRUD unificado de `Work`.

Esos cambios serán realizados en tasks posteriores.

## Criterios de aceptación

* [ ] Existe una entidad `WorkType` como catálogo.
* [ ] `Work` referencia `WorkType`.
* [ ] `Work` representa tanto obras numeradas como obras no numeradas.
* [ ] `GraphicNovel` deja de ser una entidad especializada del dominio.
* [ ] Las propiedades necesarias para representar relaciones con `Series` y otros `Work` permanecen disponibles.
* [ ] Las relaciones opcionales pueden ser nulas.
* [ ] `WorkType` no determina reglas estructurales de `Work`.
* [ ] No existen validaciones basadas en nombres o valores concretos de `WorkType`.
* [ ] Las obras existentes son preservadas mediante la migración correspondiente.
* [ ] `project/domain/domain-catalog.md` queda actualizado.
* [ ] La solución compila sin errores ni warnings.

## Resultado de la ejecución

### Qué se implementó

* Entidad `WorkType` creada como catálogo (`Id`, `Name`, `IsActive`, `CreatedAt`).
* Entidad `Work` unificada: ahora representa cualquier tipo de obra mediante `WorkTypeId`.
* Propiedades `SeriesId`, `FranchiseId`, `PublisherId`, `PreviousNumberId`, `NextNumberId` y `NumberValue` mantenidas como nullable.
* Entidades `GraphicNovel` y `Number` eliminadas del dominio.
* `WorkConfiguration` actualizada: relación con `WorkType`, índices, eliminación de TPH/discriminador.
* `WorkTypeConfiguration` creada.
* `ApplicationDbContext` actualizada con `DbSet<WorkType>`.
* Documentación de dominio actualizada: `domain-catalog.md`, `domain-content.md`, `domain-overview.md`.

### Archivos modificados

* `Domain/Entities/WorkType.cs` (nuevo)
* `Domain/Entities/Work.cs`
* `Infrastructure/Persistence/Configurations/WorkConfiguration.cs`
* `Infrastructure/Persistence/Configurations/WorkTypeConfiguration.cs` (nuevo)
* `Infrastructure/Persistence/ApplicationDbContext.cs`
* `project/domain/domain-catalog.md`
* `project/domain/domain-content.md`
* `project/domain/domain-overview.md`

### Decisiones relevantes

* `WorkType` es únicamente clasificación. No existen reglas estructurales basadas en su valor.
* Jerarquía mutuamente exclusiva nullable: exactamente uno de `PublisherId`/`FranchiseId`/`SeriesId` debe estar seteado, validado en servicio.
* Migración permite recrear la base de datos limpiamente.

### Notas

* La solución compila sin errores ni warnings.
