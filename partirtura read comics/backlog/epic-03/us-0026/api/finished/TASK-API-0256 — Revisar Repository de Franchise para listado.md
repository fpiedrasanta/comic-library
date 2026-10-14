# TASK-API-0256 — Revisar Repository de Franchise para listado

## Objetivo

Revisar si `FranchiseRepository` dispone de un método adecuado para el listado público de Franchises de US-0026.

## Requerimiento

La consulta debe permitir:

* paginación;
* búsqueda por nombre de Franchise;
* búsqueda por nombre de Publisher;
* combinación mediante OR entre ambos criterios;
* orden por `Franchise.Name ASC`;
* exclusión de Franchises inactivas.

La búsqueda debe ser equivalente a:

```text
Franchise.Name contains search
OR
Publisher.Name contains search
```

## Instrucciones

Revisar primero los métodos existentes.

Reutilizar un método existente si cumple el contrato.

Adaptarlo si puede soportar el nuevo caso sin introducir comportamiento incorrecto.

Crear un método nuevo únicamente si es necesario.

No implementar DTOs, Service ni Endpoint.

## Validación

Verificar:

* paginación;
* búsqueda parcial por Franchise;
* búsqueda parcial por Publisher;
* comportamiento OR;
* case-insensitive según las convenciones existentes;
* orden `Name ASC`;
* filtrado de inactivos;
* ejecución de filtros y ordenamiento en base de datos.

---

# Resultado de ejecución

## Veredicto

`GetPagedAsync` **no** puede reutilizarse. Se implementó `GetCatalogPagedAsync` como operación nueva.

## Por qué no se reutilizó `GetPagedAsync`

La operación administrativa existente se desvía del contrato en cuatro puntos:

1. Acepta `orderBy` y `orderDir` del caller; el orden `Franchise.Name ASC` es una regla del caso de uso.
2. Busca por `Name`, `Publisher.Name` **o** `Publisher.Country.Name`. US-0026 define solo los dos primeros.
3. Expone `publisherId`, `isActive`, `isFeatured` e `isOngoing` como filtros opcionales, ninguno de los cuales pertenece al listado público.
4. Carga `Publisher.Country` y `Publisher.Country.Name` no se necesita para la card.

## Firma implementada

```csharp
Task<(IReadOnlyList<Franchise>, int)> GetCatalogPagedAsync(
    int currentPage,
    int pageSize,
    string? search,
    CancellationToken cancellationToken = default);
```

## Comportamiento

- **Visibilidad**: `AsNoTracking()` + `.Where(f => f.IsActive && f.Publisher.IsActive)`.
- **Búsqueda**: `EF.Functions.Like(f.Name, pattern) || EF.Functions.Like(f.Publisher.Name, pattern)`, con `OR` explícito. Parcial y case-insensitive por collation de columna. Con `search` nulo o en blanco no se aplica filtro.
- **Orden**: `.OrderBy(f => f.Name).ThenBy(f => f.Id)`, fijo y estable entre páginas.
- **Paginación**: `Skip`/`Take` en base de datos, con el total contado antes del `Skip`.
- **Carga**: `Include(f => f.Image)` y `Include(f => f.Publisher)`. Dos navegaciones, por lo que no aplica `AsSplitQuery`.

## Decisión: toda la cadena activa

Por decisión humana, el listado exige que **toda** la cadena esté activa, no solo la propia Franchise. Se descartó la lectura literal de la task (filtrar solo `Franchise.IsActive`) porque habría mostrado cards con el pill de una editorial desactivada, que es incoherente con `/api/franchises/{id}` y `/api/publishers/{id}`, que sí devuelven `404` para entidades inactivas.

Como `Franchise.PublisherId` es una FK requerida, `f.Publisher.IsActive` se traduce a un inner join: una Franchise de editorial inactiva queda excluida y la navegación `Publisher` nunca llega nula al Service. Esto se verificó con `Franchises_ReturnOnlyActiveOnesWhosePublisherIsActive`, que cruza el resultado contra las editoriales inactivas obtenidas por la vía administrativa.

## Archivos modificados

- `api/Application/Interfaces/IFranchiseRepository.cs` — nueva operación en el contrato.
- `api/Infrastructure/Repositories/FranchiseRepository.cs` — `GetCatalogPagedAsync` + helper privado `ApplyCatalogSearch`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests: activos con editorial activa, orden `Name ASC`, búsqueda por nombre de Franchise y por nombre de Publisher, `OR` entre ambos, paginación estable, nodo `Publisher` poblado, `pageSize` acotado y búsqueda sin resultados.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Paginación, búsqueda parcial por Franchise y por Publisher, `OR` entre ambos, case-insensitive, orden `Name ASC`, filtrado de inactivos y ejecución en base de datos: los siete puntos de la validación están cubiertos. No se implementaron DTOs, Service ni Endpoint en esta task.