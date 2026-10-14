# TASK-API-0159 — Implementar entidad y persistencia de Serie

## Objetivo

Implementar la entidad de dominio y la persistencia necesaria para administrar Series en Comic Library.

La implementación debe respetar las reglas definidas en `US-0016 — Administrar series`.

## Alcance

Implementar:

- Entidad `Series` o `Serie`, siguiendo la convención utilizada actualmente en el proyecto.
- Configuración Entity Framework.
- Relación obligatoria con `Franchise`.
- Relación opcional con `Image`.
- Propiedades:
  - `Id`
  - `Name`
  - `FranchiseId`
  - `ImageId`
  - `Color`
  - `IsFeatured`
  - `IsOngoing`
  - `IsActive`
  - Campos de auditoría que correspondan al modelo existente.

## Reglas

- `FranchiseId` es obligatorio.
- Una Serie pertenece a una única Franquicia.
- Una Franquicia puede tener múltiples Series.
- Una Serie puede tener una imagen propia.
- Una Serie puede tener un color propio.
- `Name` no tiene restricción de unicidad.
- `IsActive` representa si la Serie está habilitada en Comic Library.
- `IsOngoing` representa si la Serie continúa vigente/generando publicaciones.

## Relaciones

La relación conceptual debe ser:

`Publisher → Franchise → Series`

La Serie debe conservar únicamente la relación directa con `Franchise`.

No debe duplicarse `PublisherId` en la entidad Serie.

## Repository

Implementar:

- `ISeriesRepository`
- `SeriesRepository`

El repositorio debe permitir las operaciones necesarias para las siguientes tasks:

- Consulta paginada.
- Consulta por ID.
- Consulta de existencia.
- Alta.
- Modificación.
- Activación.
- Desactivación.

Las consultas de solo lectura deben utilizar `AsNoTracking()` cuando corresponda.

## UnitOfWork

Integrar `ISeriesRepository` y `SeriesRepository` al `IUnitOfWork` / implementación concreta siguiendo el patrón existente en el proyecto.

## Criterios de aceptación

- La entidad Serie está correctamente configurada.
- `FranchiseId` es obligatorio.
- No existe índice único sobre `Name`.
- La relación con Franchise funciona correctamente.
- La relación con Image es opcional.
- El proyecto compila correctamente.
- No se modifica la arquitectura existente de Repository / UnitOfWork.

## Resultado

### Implementación

- **Entidad**: `Domain/Entities/Series.cs` con propiedades: Id, Name, IsFeatured, IsOngoing, IsActive, Color, CreatedAt, navegación a Franchise (requerido) e Image (opcional).
- **Configuración**: `Infrastructure/Persistence/Configurations/SeriesConfiguration.cs` con tabla "Series", FK a Franchise (Restrict) e Image (SetNull), índices en Name, IsActive, IsFeatured, IsOngoing, FranchiseId.
- **Repositorio**: `Application/Interfaces/ISeriesRepository.cs` e `Infrastructure/Repositories/SeriesRepository.cs` con operaciones: GetByIdAsync, GetPagedAsync (con filtros publisherId, franchiseId, isActive, isFeatured, isOngoing), ExistsAsync, AddAsync, UpdateAsync.
- **DbContext**: Agregado `DbSet<Series>` y `ApplyConfiguration(new SeriesConfiguration())`.

### Notas

- `FranchiseId` es shadow property (sin propiedad explícita en la entidad), siguiendo el patrón de Franchise.
- Sin restricción de unicidad sobre Name.
- Ordenamiento por Name, Franchise, Publisher, Country.
- Carga de navegación completa para evitar N+1: Franchise, Franchise.Publisher, Franchise.Publisher.Country, Franchise.Image, Image.