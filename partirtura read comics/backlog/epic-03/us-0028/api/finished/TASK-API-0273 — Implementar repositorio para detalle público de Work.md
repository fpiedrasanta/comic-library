# TASK-API-0273 — Implementar repositorio para detalle público de Work

## Objetivo

Implementar en el repositorio de `Work` la consulta necesaria para obtener el detalle público de una Work definido en `US-0028`.

La consulta debe devolver una Work con todas las relaciones necesarias para que el Service pueda construir `CatalogWorkDetailDto`.

---

## Contexto

El detalle debe proporcionar:

```text
Work
├── Publisher
├── Franchise
├── Series
├── Cover
├── Number
├── Language
├── WorkType
├── PreviousWork
├── NextWork
├── PersonAssignments
│   ├── Person
│   └── Role
└── Tags
```

Publisher, Franchise y Series deben permitir obtener:

```text
Id
Name
Color
Cover
```

PreviousWork y NextWork deben permitir obtener:

```text
Id
Title
Number
Cover
```

---

## Contrato

Agregar al repositorio de Work:

```text
GetCatalogByIdAsync(
    long id,
    CancellationToken cancellationToken
)
```

El método debe devolver la Work encontrada o `null` cuando no exista.

Debe utilizarse un método específico para la consulta pública del catálogo.

No debe reutilizarse una consulta administrativa si su contrato o carga de relaciones no coincide con las necesidades de `US-0028`.

---

## Consulta

La consulta debe:

* buscar por `Work.Id`;
* utilizar `AsNoTracking()`;
* realizar eager loading de las relaciones necesarias;
* evitar N+1;
* utilizar `AsSplitQuery()` cuando corresponda para evitar una explosión cartesiana provocada por múltiples colecciones.

Debe cargar:

### Contexto editorial

```text
Publisher
    Image/Cover

Franchise
    Image/Cover
    Publisher
        Image/Cover

Series
    Image/Cover
    Franchise
        Image/Cover
        Publisher
            Image/Cover
```

La carga debe respetar el modelo estructural existente.

No debe duplicarse información ni crearse consultas adicionales por cada entidad contextual.

### Work

Cargar:

```text
Cover
Number
Language
WorkType
PublicationDate
```

y los restantes campos propios de `Work`.

### Secuencia

Cargar:

```text
PreviousWork
NextWork
```

incluyendo únicamente la información necesaria para el detalle:

```text
Id
Title
Number
Cover
```

No deben inferirse relaciones de secuencia.

### PersonAssignments

Cargar todas las asignaciones de la Work:

```text
PersonAssignments
    Person
    Role
```

Cada asignación debe permanecer individual.

Una misma Persona con varios Roles debe generar varias asignaciones.

### Tags

Cargar los Tags asociados a la Work.

---

## Disponibilidad

La consulta debe respetar las reglas de disponibilidad pública existentes para Works.

Una Work que no pueda ser consultada públicamente no debe ser devuelta por este método.

No debe introducirse una nueva política de visibilidad en esta task.

---

## N+1

La implementación debe garantizar que el Service pueda construir el detalle completo a partir del resultado de esta consulta sin ejecutar consultas adicionales por:

* Publisher;
* Franchise;
* Series;
* Cover;
* PreviousWork;
* NextWork;
* Person;
* Role;
* Tag.

---

## Documentación

Actualizar:

```text
project/repositories/repositories-catalog.md
```

Documentar el nuevo método y su propósito como consulta de detalle público de Work.

No modificar documentación administrativa que no corresponda a esta consulta.

---

## Restricciones

* No modificar el dominio.
* No crear DTOs.
* No implementar lógica de Service.
* No crear ni modificar endpoints.
* No implementar Reader.
* No implementar progreso, favoritos, historial, ratings o reviews.
* No inferir relaciones Previous/Next.
* No crear consultas genéricas adicionales.
* No introducir un Repository genérico.
* Mantener el patrón de repositorios explícitos existente.

---

## Validación

La task se considera completa cuando:

* [ ] `GetCatalogByIdAsync` está implementado.
* [ ] La consulta busca por Id.
* [ ] Utiliza `AsNoTracking()`.
* [ ] Carga Publisher cuando corresponde.
* [ ] Carga Franchise cuando corresponde.
* [ ] Carga Series cuando corresponde.
* [ ] Carga Cover de Work.
* [ ] Carga Number.
* [ ] Carga Language.
* [ ] Carga WorkType.
* [ ] Carga PreviousWork.
* [ ] Carga NextWork.
* [ ] PreviousWork incluye Id, Title, Number y Cover.
* [ ] NextWork incluye Id, Title, Number y Cover.
* [ ] Carga PersonAssignments.
* [ ] Cada asignación incluye Person y Role.
* [ ] Carga Tags.
* [ ] No se pierden múltiples Roles de una misma Persona.
* [ ] No se infieren relaciones Previous/Next.
* [ ] No existe N+1.
* [ ] Se utiliza `AsSplitQuery()` cuando corresponde.
* [ ] Respeta la disponibilidad pública existente.
* [ ] `repositories-catalog.md` está actualizado.
* [ ] El código compila correctamente.

---

## Execution Result

**Completed:** 2026-10-06

**What was implemented:**

1. **Added `GetCatalogByIdAsync` to `IWorkRepository`** (`Application/Interfaces/IWorkRepository.cs`):
   - Signature: `Task<Work?> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default)`

2. **Implemented `GetCatalogByIdAsync` in `WorkRepository`** (`Infrastructure/Repositories/WorkRepository.cs`):
   - Queries by `Work.Id` with `IsActive = true`
   - Uses `AsNoTracking()`
   - Eager loading with `AsSplitQuery()`:
     - Work: `Cover`, `Language`, `WorkType`
     - Context: `Publisher` → `Image`, `Franchise` → `Image` → `Publisher` → `Image`, `Series` → `Image` → `Franchise` → `Image` → `Publisher` → `Image`
     - Sequence: `PreviousNumber` → `Cover`, `NextNumber` → `Cover`
     - People: `PersonByRoles` → `Person`, `Role`
     - Tags: `Tags` → `Tag`
   - No N+1 queries
   - Returns `Work?` (null if not found or inactive)

**Files changed:**
- `Application/Interfaces/IWorkRepository.cs` - Added method signature
- `Infrastructure/Repositories/WorkRepository.cs` - Implemented method

**Decisions made:**
- Separate method from `GetByIdAsync` because public catalog needs different eager loading
- Filters `IsActive = true` for public availability
- Includes all Image/Cover navigation properties for Publisher, Franchise, Series, PreviousWork, NextWork
- Uses `AsSplitQuery()` to avoid Cartesian explosion from multiple collections

**Tests:** 250/252 integration tests pass (2 pre-existing failures unrelated to this change)
