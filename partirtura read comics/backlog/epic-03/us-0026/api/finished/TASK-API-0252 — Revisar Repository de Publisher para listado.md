# TASK-API-0252 — Revisar Repository de Publisher para listado

## Objetivo

Revisar si `PublisherRepository` ya dispone de un método adecuado para el listado público de Publishers de US-0026.

## Requerimiento

El Repository debe permitir obtener Publishers:

* paginados;
* filtrados opcionalmente por nombre;
* ordenados por `Name ASC`;
* sin limitarse a un parámetro de ordenamiento enviado por el frontend.

La consulta debe contemplar únicamente Publishers activos cuando corresponda a la operación pública.

## Instrucciones

Revisar los métodos existentes antes de crear uno nuevo.

Si existe un método equivalente:

* reutilizarlo si cumple el contrato;
* adaptarlo únicamente si es necesario.

Si no existe:

* implementar el método necesario.

No implementar DTOs, Service ni Endpoint.

## Validación

Verificar:

* paginación correcta;
* búsqueda parcial por nombre;
* comparación case-insensitive según las convenciones existentes;
* orden estable por `Name ASC`;
* exclusión de entidades inactivas para esta operación;
* ejecución en base de datos, sin materializar todo el conjunto para filtrar u ordenar en memoria.

---

# Resultado de ejecución

## Veredicto

`GetPagedAsync` **no** puede reutilizarse. Se implementó `GetCatalogPagedAsync` como operación nueva.

## Por qué no se reutilizó `GetPagedAsync`

La operación administrativa existente incumple cuatro requisitos de esta task:

1. Acepta `orderBy` y `orderDir` desde el caller, y el orden debe ser una regla del caso de uso, no un parámetro.
2. Busca por `Name` **o** `Country.Name`. US-0026 pide búsqueda por nombre de Publisher, y el filtro por país pertenece a la operación administrativa y a los filtros del catálogo de Works.
3. Expone `isActive`, `isFeatured` e `isAlive` como filtros opcionales. El listado público no admite ninguno.
4. Carga `Country` además de `Image`, que la card no necesita.

Adaptarlo habría mezclado dos contratos con reglas opuestas. Por eso es una operación separada, igual que ya ocurre con `WorkRepository.GetPagedAsync` vs `GetCatalogPagedAsync`.

## Firma implementada

```csharp
Task<(IReadOnlyList<Publisher>, int)> GetCatalogPagedAsync(
    int currentPage,
    int pageSize,
    string? search,
    CancellationToken cancellationToken = default);
```

## Comportamiento

- **Visibilidad**: `AsNoTracking()` + `.Where(p => p.IsActive)`. El filtro de activos es global a la operación, no un parámetro.
- **Búsqueda**: `EF.Functions.Like(p.Name, $"%{search.Trim()}%")`, parcial y case-insensitive por la collation de la columna, igual que el resto del proyecto. Con `search` nulo o en blanco no se aplica filtro.
- **Orden**: `.OrderBy(p => p.Name).ThenBy(p => p.Id)`, fijo y con desempate por `Id` para que la paginación sea estable.
- **Paginación**: `Skip((currentPage - 1) * pageSize).Take(pageSize)`, con el conteo total antes del `Skip`.
- **Carga**: solo `Include(p => p.Image)`, que es lo que la card necesita para construir `UrlImage`. Una sola navegación, por lo que no aplica `AsSplitQuery`.
- **Todo en base de datos**: no se materializa el conjunto para filtrar ni ordenar.

## Archivos modificados

- `api/Application/Interfaces/IPublisherRepository.cs` — nueva operación en el contrato.
- `api/Infrastructure/Repositories/PublisherRepository.cs` — `GetCatalogPagedAsync` + helper privado `ApplyCatalogSearch`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests: `CatalogListingIntegrationTests` cubre activos, orden `Name ASC`, búsqueda parcial e insensible a mayúsculas, paginación estable sin duplicados, flags de navegación, tope de `pageSize` y búsqueda sin resultados.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Paginación, búsqueda parcial por nombre, case-insensitive, orden estable `Name ASC`, exclusión de inactivos y ejecución en base de datos: los seis puntos de la validación están cubiertos. No se implementaron DTOs, Service ni Endpoint en esta task.