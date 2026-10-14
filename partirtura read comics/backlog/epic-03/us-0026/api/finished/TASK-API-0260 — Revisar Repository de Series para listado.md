# TASK-API-0260 — Revisar Repository de Series para listado

## Objetivo

Revisar si `SeriesRepository` dispone de un método adecuado para el listado público de Series de US-0026.

## Requerimiento

La consulta debe permitir:

* paginación;
* búsqueda por nombre de Series;
* búsqueda por nombre de Franchise;
* búsqueda por nombre de Publisher;
* combinación mediante OR entre los tres criterios;
* orden por `Series.Name ASC`;
* exclusión de Series inactivas.

La búsqueda debe ser equivalente a:

```text
Series.Name contains search
OR
Franchise.Name contains search
OR
Publisher.Name contains search
```

## Instrucciones

Revisar primero los métodos existentes.

Reutilizar o adaptar un método existente cuando corresponda.

Crear un método nuevo únicamente si es necesario.

No implementar DTOs, Service ni Endpoint.

## Validación

Verificar:

* paginación;
* búsqueda parcial por Series;
* búsqueda parcial por Franchise;
* búsqueda parcial por Publisher;
* OR entre los tres criterios;
* case-insensitive según las convenciones existentes;
* orden `Series.Name ASC`;
* filtrado de inactivos;
* ejecución en base de datos.

---

# Resultado de ejecución

## Veredicto

`GetPagedAsync` **no** puede reutilizarse. Se implementó `GetCatalogPagedAsync` como operación nueva.

## Por qué no se reutilizó `GetPagedAsync`

La operación administrativa existente se desvía del contrato en cuatro puntos:

1. Acepta `orderBy` y `orderDir` del caller; el orden `Series.Name ASC` es una regla del caso de uso.
2. Expone `publisherId`, `franchiseId`, `isActive`, `isFeatured` e `isOngoing` como filtros opcionales. US-0026 no define filtros jerárquicos ni banderas para el listado.
3. Carga `Franchise.Image` y `Franchise.Publisher.Country`, que la card no necesita.
4. Su búsqueda sí coincidía con el contrato de la US, pero no alcanza para justificar reutilizar un método con las otras tres diferencias.

## Firma implementada

```csharp
Task<(IReadOnlyList<Series>, int)> GetCatalogPagedAsync(
    int currentPage,
    int pageSize,
    string? search,
    CancellationToken cancellationToken = default);
```

## Comportamiento

- **Visibilidad**: `AsNoTracking()` + `.Where(s => s.IsActive && s.Franchise.IsActive && s.Franchise.Publisher.IsActive)`.
- **Búsqueda**: `EF.Functions.Like(s.Name, pattern) || EF.Functions.Like(s.Franchise.Name, pattern) || EF.Functions.Like(s.Franchise.Publisher.Name, pattern)`, con `OR` explícito. Parcial y case-insensitive por collation de columna. Con `search` nulo o en blanco no se aplica filtro.
- **Orden**: `.OrderBy(s => s.Name).ThenBy(s => s.Id)`, fijo y estable entre páginas.
- **Paginación**: `Skip`/`Take` en base de datos, con el total contado antes del `Skip`.
- **Carga**: `Include(s => s.Image)` y `Include(s => s.Franchise).ThenInclude(f => f.Publisher)`, con `AsSplitQuery()`: son tres llamadas `Include`/`ThenInclude`, por lo que la convención del proyecto lo exige.

## Decisión: toda la cadena activa

Por decisión humana, el listado exige que **toda** la cadena esté activa: la propia Series, su Franchise y el Publisher de esa Franchise. Se descartó la lectura literal de la task (filtrar solo `Series.IsActive`) porque habría mostrado cards con pills de Franchise o Publisher desactivados, incoherente con `/api/series/{id}` y `/api/publishers/{id}`, que devuelven `404` para entidades inactivas.

`Series.FranchiseId` y `Franchise.PublisherId` son FKs requeridas, así que ambas condiciones se traducen a inner joins y las navegaciones llegan siempre pobladas al Service. Se verificó con `Series_ReturnOnlyActiveOnesWhoseFranchiseAndPublisherAreActive`.

## Inconsistencia detectada en el código existente

`SeriesRepository.GetPagedAsync` (administrativo) carga cuatro navegaciones —`Franchise`, `Franchise.Publisher`, `Franchise.Publisher.Country` y `Franchise.Image`, más `Image`— sin `AsSplitQuery()`, en contra de la convención documentada en `project/repositories.md` ("toda query con 3 o más `Include`/`ThenInclude` usa `AsSplitQuery()`"). No se modificó en esta task porque su alcance es el listado público y el cambio afecta el contrato administrativo. Queda reportado para que se decida en una task propia.

## Archivos modificados

- `api/Application/Interfaces/ISeriesRepository.cs` — nueva operación en el contrato.
- `api/Infrastructure/Repositories/SeriesRepository.cs` — `GetCatalogPagedAsync` + helper privado `ApplyCatalogSearch`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests: activos con cadena activa, orden `Name ASC`, búsqueda por los tres nombres, `OR` entre los tres, ambos nodos poblados, `pageSize` acotado, paginación estable y búsqueda sin resultados.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Paginación, búsqueda parcial por los tres nombres, `OR` entre los tres, case-insensitive, orden `Series.Name ASC`, filtrado de inactivos y ejecución en base de datos: los ocho puntos de la validación están cubiertos. No se implementaron DTOs, Service ni Endpoint en esta task.