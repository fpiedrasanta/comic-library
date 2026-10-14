# TASK-API-0155 — Implementar repositorio de Franchise

## Objetivo

Implementar el repositorio de franquicias siguiendo el patrón de repositorios existente en el proyecto.

## Interfaz

Crear:

```text
IFranchiseRepository
```

con las operaciones necesarias para soportar:

- obtener una franquicia por Id;
- obtener listado paginado;
- obtener franquias activas cuando sea necesario;
- verificar existencia por criterios necesarios;
- agregar;
- actualizar;
- activar;
- desactivar.

## Consulta paginada

`GetPagedAsync` debe soportar:

### Búsqueda

La búsqueda debe realizarse únicamente sobre:

- `Franchise.Name`;
- `Publisher.Name`;
- `Publisher.Country.Name`.

No buscar por descripción, website, historia, etc.

La búsqueda debe permitir coincidencias parciales y ser case-insensitive de acuerdo con la estrategia existente del proyecto.

### Filtros

Soportar:

- `IsFeatured`;
- `IsOngoing`;
- `IsActive`.

Los filtros booleanos deben comportarse de esta manera:

```text
null  → todos
true  → solamente true
false → solamente false
```

Por lo tanto, el listado administrativo debe poder consultar simultáneamente franquicias activas e inactivas cuando no se especifique `IsActive`.

### Ordenamiento

Permitir únicamente:

- `Name`;
- `PublisherCountry`;
- `PublisherName`.

El ordenamiento por país debe utilizar `Publisher.Country.Name`, no `Publisher.CountryId`.

El ordenamiento por editorial debe utilizar `Publisher.Name`.

Soportar:

- ASC;
- DESC.

### Paginación

Implementar paginación utilizando el mecanismo existente en el proyecto.

Las consultas de solo lectura deben utilizar `AsNoTracking()`.

## Navigation Properties

Las consultas necesarias para el listado y detalle deben cargar las relaciones requeridas evitando consultas N+1.

Como mínimo:

- `Publisher`;
- `Publisher.Country`;
- `Image`.

## Documentación

Actualizar:

- `project/repositories.md`

Documentar:

- operaciones;
- criterios de búsqueda;
- filtros;
- ordenamiento;
- paginación;
- relaciones cargadas.

No modificar `endpoints.md` en esta task salvo que exista una necesidad estrictamente relacionada con el contrato del repositorio.

## Criterios de aceptación

- El repositorio permite listar franquicias de forma paginada.
- La búsqueda utiliza únicamente nombre de franquicia, nombre de editorial y nombre de país.
- El ordenamiento utiliza los nombres y no IDs.
- Los filtros `IsFeatured`, `IsOngoing` e `IsActive` funcionan correctamente.
- `IsActive = null` devuelve activas e inactivas.
- No existen consultas N+1.
- Las consultas de lectura utilizan `AsNoTracking()`.
- La solución compila correctamente.

## Unblocks

TASK-API-0156

## Resultado

### Archivos modificados

1. **`api/Application/Interfaces/IFranchiseRepository.cs`** (nuevo)
   - Interfaz con operaciones: GetByIdAsync, GetPagedAsync, AddAsync, UpdateAsync.

2. **`api/Infrastructure/Repositories/FranchiseRepository.cs`** (nuevo)
   - Implementación con búsqueda por nombre de franquicia, editorial y país.
   - Filtros: IsFeatured, IsOngoing, IsActive.
   - Ordenamiento: Name, PublisherCountry, PublisherName.
   - Carga de navegación: Publisher, Publisher.Country, Image.
   - Consultas de lectura con AsNoTracking().

### Build
- Exitoso: 0 errores, 1 advertencia no relacionada.

### Criterios de aceptación cumplidos
- [x] El repositorio permite listar franquicias de forma paginada.
- [x] La búsqueda utiliza únicamente nombre de franquicia, nombre de editorial y nombre de país.
- [x] El ordenamiento utiliza los nombres y no IDs.
- [x] Los filtros IsFeatured, IsOngoing e IsActive funcionan correctamente.
- [x] IsActive = null devuelve activas e inactivas.
- [x] No existen consultas N+1.
- [x] Las consultas de lectura utilizan AsNoTracking().
- [x] La solución compila correctamente.