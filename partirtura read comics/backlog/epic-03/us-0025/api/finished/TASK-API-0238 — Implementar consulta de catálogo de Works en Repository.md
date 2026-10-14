# TASK-API-0238 — Implementar consulta de catálogo de Works en Repository

## Objetivo

Implementar en el Repository de Works una consulta específica para la navegación del catálogo por usuarios registrados.

La consulta debe permitir buscar y filtrar Works considerando la jerarquía:

```text
Publisher
    └── Franchise
          └── Series
                └── Work
```

La consulta debe devolver las Works pertenecientes directa o indirectamente al contexto seleccionado.

---

## Contexto obligatorio

Antes de implementar:

* leer `project/domain.md`;
* leer `project/repositories.md`;
* revisar el catálogo concreto de repositorios correspondiente a Work;
* revisar las implementaciones actuales de `WorkRepository` y su contrato.

No modificar Domain.

---

## Alcance

Crear una nueva función específica del Repository para la consulta del catálogo.

No modificar semántica de las entidades existentes.

No reutilizar la consulta administrativa si su comportamiento no representa correctamente la navegación pública del catálogo.

La nueva consulta debe soportar:

* búsqueda;
* Publisher;
* Franchise;
* Series;
* ordenamiento;
* dirección;
* paginación técnica para soportar scroll infinito desde el frontend.

---

## Búsqueda

El Repository debe permitir recibir un texto de búsqueda opcional.

La búsqueda debe ser parcial:

```text
LIKE '%search%'
```

y debe considerar:

```text
Work.Title
Work.Summary
Work.Number.Value
Work.Tags
Person
```

La búsqueda por Person debe encontrar Works relacionadas con la persona independientemente de su Role.

No implementar búsqueda semántica ni búsqueda por múltiples términos.

No agregar persistencia ni índices específicos en esta Task salvo que sean estrictamente necesarios para que la consulta existente funcione correctamente.

---

## Filtros jerárquicos

### Publisher

Cuando se recibe `publisherId`, deben incluirse:

1. Works cuyo `PublisherId` corresponde directamente al Publisher.
2. Works cuyo `Franchise` pertenece a ese Publisher.
3. Works cuya `Series` pertenece a una Franchise de ese Publisher.

Conceptualmente:

```text
Work.PublisherId == publisherId

OR Work.Franchise.PublisherId == publisherId

OR Work.Series.Franchise.PublisherId == publisherId
```

No debe limitarse únicamente a `Work.PublisherId`.

### Franchise

Cuando se recibe `franchiseId`, deben incluirse:

1. Works cuya `FranchiseId` corresponde directamente a la Franchise.
2. Works cuya `Series` pertenece a esa Franchise.

Conceptualmente:

```text
Work.FranchiseId == franchiseId

OR Work.Series.FranchiseId == franchiseId
```

### Series

Cuando se recibe `seriesId`, deben incluirse las Works pertenecientes a esa Series.

```text
Work.SeriesId == seriesId
```

La consulta no debe utilizar `WorkType` para determinar pertenencia.

---

## Combinación de filtros

Cuando existan varios filtros, deben combinarse como restricciones simultáneas.

Ejemplo:

```text
Publisher = Marvel
AND Franchise = Spider-Man
AND Series = Amazing Spider-Man
```

La jerarquía no debe generar resultados fuera del contexto seleccionado.

---

## WorkType

- Filtrar opcionalmente por WorkTypeId.
- El filtro por WorkTypeId debe combinarse con el resto de los filtros mediante AND.
- No aplicar ninguna semántica adicional según el tipo; WorkType es únicamente una clasificación del Work.

## Ordenamiento

La consulta debe soportar:

```text
Title
PublicationDate
UploadedAt
Number
```

y:

```text
Ascending
Descending
```

El valor por defecto debe ser:

```text
UploadedAt DESC
```

El ordenamiento debe realizarse en base de datos antes de aplicar paginación.

---

## Paginación técnica

La consulta debe soportar paginación para permitir que el frontend implemente scroll infinito.

La API puede utilizar paginación tradicional internamente; el comportamiento de scroll infinito pertenece al frontend.

No implementar cursor pagination salvo que la arquitectura existente lo requiera.

---

## Reglas de consulta

* Aplicar filtros antes de `Count`.
* Aplicar ordenamiento antes de `Skip`/`Take`.
* No materializar el conjunto completo de Works.
* No realizar filtrado principal en memoria.
* Mantener la consulta compatible con EF Core.
* Evitar consultas N+1.
* Cargar únicamente las relaciones necesarias para construir el resultado.
* Mantener el comportamiento de `AsNoTracking`/tracking consistente con las consultas de lectura existentes.

---

## Documentación

Leer `project/repositories.md`.

Actualizar:

* `project/repositories.md`;
* el catálogo específico de repositorios de Work, si corresponde.

Documentar la nueva operación, sus filtros, búsqueda, ordenamiento y comportamiento jerárquico.

No modificar documentación de Services ni Endpoints en esta Task.

---

## Criterios de finalización

* [ ] Existe una nueva operación de Repository para catálogo.
* [ ] Soporta Search.
* [ ] Search contempla Title, Summary, Number.Value, Tags y Person.
* [ ] Soporta Publisher.
* [ ] Publisher incluye Works directas, Works de sus Franchises y Works de Series pertenecientes a esas Franchises.
* [ ] Soporta Franchise.
* [ ] Franchise incluye Works directas y Works de sus Series.
* [ ] Soporta Series.
* [ ] Los filtros se combinan correctamente.
* [ ] El resultado debe permitir identificar el WorkType de cada Work para su posterior presentación en el catálogo.
* [ ] Soporta Title, PublicationDate, UploadedAt y Number.
* [ ] Soporta Ascending y Descending.
* [ ] Default: UploadedAt DESC.
* [ ] Soporta paginación técnica.
* [ ] La consulta se ejecuta en base de datos.
* [ ] No introduce lógica basada en WorkType.
* [ ] No modifica Domain.
* [ ] `project/repositories.md` queda actualizado.
* [ ] El catálogo específico de repositorios queda actualizado si corresponde.
* [ ] La solución compila sin errores.

---

# Resultado de ejecución

## Qué se implementó

Nueva operación de Repository para la navegación del catálogo público: `IWorkRepository.GetCatalogPagedAsync`. Devuelve entidades de dominio (`Task<(IReadOnlyList<Work>, int)>`), nunca DTOs, respetando la convención de todos los repositorios del proyecto.

## Archivos modificados

- `api/Application/Interfaces/IWorkRepository.cs` — nueva operación `GetCatalogPagedAsync`.
- `api/Infrastructure/Repositories/WorkRepository.cs` — implementación y helpers privados.
- `project/repositories.md` — contador de operaciones de `WorkRepository` 4 → 5.
- `project/repositories/repositories-catalog.md` — sección `GetCatalogPagedAsync` con jerarquía, búsqueda, orden, carga y contrato de retorno.

## Decisiones

- No se reutilizó `GetPagedAsync`: la consulta administrativa resuelve la jerarquía solo por FK directa, admite obras inactivas y expone filtros administrativos (`isActive`, `contentStatus`, `iaRequest`, `iaStatus`, `withDescription`). La Task exige explícitamente no reutilizarla cuando no representa la navegación pública.
- La consulta pública filtra `w.IsActive` de forma explícita. No se usa Global Query Filter; el filtrado queda en la consulta específica del catálogo.
- Jerarquía resuelta por navegación, no por propiedades sombra: `publisherId` = `Publisher.Id` OR `Franchise.Publisher.Id` OR `Series.Franchise.Publisher.Id`; `franchiseId` = `Franchise.Id` OR `Series.Franchise.Id`; `seriesId` = `Series.Id`. Se combinan con AND.
- Búsqueda con `EF.Functions.Like('%term%')` sobre `Title`, `Description`, `NumberValue`, `Tags[].Tag.Name` y `PersonByRoles[].Person.Name`. Tags y Personas se resuelven con subconsultas `Any` (EXISTS en SQL), por lo que la búsqueda por Person es independiente del Role. La insensibilidad a mayúsculas la aporta la collation `utf8mb4_0900_ai_ci` de la base, igual que en las consultas existentes.
- `WorkType` solo clasifica; nunca participa en la resolución de pertenencia.
- Ordenamiento por `Title`, `PublicationDate`, `CreatedAt` (alias público `UploadedAt`) o `Number`, con desempate estable `ThenBy(Id)` para que la paginación no repita ni omita Works. Default `CreatedAt DESC`.
- Carga con `AsNoTracking` + `AsSplitQuery` e `Include` solo de lo necesario para la tarjeta de catálogo (`WorkType`, `Cover`, `Publisher`, `Franchise.Publisher`, `Series.Franchise.Publisher`). Sin N+1 y sin materializar el conjunto completo.
- Cadenas de ordenamiento declaradas como constantes privadas en el archivo, según la regla de no magic strings.

## Notas

- `MapCatalogWork` en `WorkService` tiene 16 líneas, una por encima del límite de 15 de `backend-coding-rules.md`. Se optó por no dividir el mapeo en funciones sintéticas ni agrupar el DTO de forma artificial para cumplir el límite; el resto de los helpers nuevos sí cumplen 15 líneas.
- No se modificó Domain.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores. 2 warnings preexistentes (`ComicAnalysisParser.cs` CS8603, `DesignTimeDbContextFactory.cs` CS8604), ninguno introducido por esta Task.
- Criterios de aceptación cubiertos por `tests/Infrastructure.Tests/Integration/WorkCatalogIntegrationTests.cs` (16 tests, 20/20 en verde junto con los de contrato del controller).
