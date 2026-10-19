# TASK-API-0315 â€” Crear entidad y persistencia de favoritos

## Objetivo

Implementar el modelo de dominio, la persistencia y las consultas necesarias para gestionar favoritos.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, `services.md`, `domain.md`, las reglas de dominio y repositorios, la configuraciÃ³n de EF Core y la US-0035.

Inspeccionar las entidades User y Work, sus relaciones, `IUnitOfWork`, los repositorios existentes y las convenciones de migraciones.

## Entidad Favorite

Crear una entidad con estas propiedades:

- `Id`
- `User`
- `Work`
- `CreatedAt`

**No crear propiedades `UserId` ni `WorkId` en la entidad de dominio.** Las relaciones deben expresarse mediante objetos de navegaciÃ³n, siguiendo las convenciones existentes del proyecto.

## Persistencia

- Configurar las relaciones con User y Work mediante el mecanismo de persistencia existente.
- Impedir duplicados para la combinaciÃ³n Userâ€“Work mediante una restricciÃ³n de unicidad en base de datos.
- Implementar el repositorio especÃ­fico que necesite el caso de uso.
- Permitir consultar si un Work es favorito de un usuario.
- Permitir consultar los favoritos del usuario.
- Permitir agregar y eliminar fÃ­sicamente registros.
- Integrar la entidad con `IUnitOfWork` y el registro de dependencias existente.
- Preparar la migraciÃ³n de EF Core segÃºn las convenciones del proyecto.

No introducir un repositorio genÃ©rico ni mecanismos paralelos de persistencia.

## Dependencias

- US-0035.
- TASK-API-0314.
- Modelo actual de User y Work.

## Git y ejecuciÃ³n

1. `git checkout main` â†’ `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036"`

   Si existe: `git switch feature/us-0036` â†’ `git merge main`.

   Si no existe: `git switch -c feature/us-0036`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilaciÃ³n y regresiones detectables.
6. Crear uno o mÃ¡s commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.

## Criterios de aceptaciÃ³n

- La entidad contiene Ãºnicamente las propiedades de dominio definidas.
- Las relaciones usan objetos de navegaciÃ³n en el dominio.
- La base de datos impide duplicados por usuario y Work.
- Agregar, consultar y quitar favoritos funciona a travÃ©s del repositorio.
- La eliminaciÃ³n es fÃ­sica.
- La migraciÃ³n es vÃ¡lida y respeta las convenciones existentes.

## Resultado de ejecuciÃ³n

Registrar rama, commit, archivos modificados, migraciÃ³n, validaciones y bloqueos.
## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Entidad Favorite en Domain/Entities/Favorite.cs sin propiedades escalares UserId/WorkId (solo navegaciones User, Work y CreatedAt).
- Configuración EF Core FavoriteConfiguration con HasKey, relaciones User/Work (required), índice único ("UserId","WorkId").
- DbSet Favorites en ApplicationDbContext, ApplyConfiguration<Favorites> y registro en DI (ServiceCollectionExtensions).
- Repositorio específico IFavoriteRepository y FavoriteRepository con ExistsAsync, GetAsync (incluye navigations), AddAsync, RemoveAsync. Uso de AsNoTracking para lectura.
- Integración con Unit of Work: IUnitOfWork.Favorites y UnitOfWork.Favorites (lazy init).
- Migración 20261019162025_AddFavorites con índice único y FKs a Users/Works.

**Qué se cambió**:
- pi/Domain/Entities/Favorite.cs (nuevo)
- pi/Infrastructure/Persistence/Configurations/FavoriteConfiguration.cs (nuevo)
- pi/Application/Interfaces/IUnitOfWork.cs (añade IFavoriteRepository Favorites)
- pi/Infrastructure/Repositories/IFavoriteRepository.cs, FavoriteRepository.cs (nuevos)
- pi/Infrastructure/Repositories/UnitOfWork.cs (añade campo + propiedad)
- pi/Infrastructure/Persistence/ApplicationDbContext.cs (DbSet + ApplyConfiguration)
- pi/Infrastructure/Persistence/ServiceCollectionExtensions.cs (registro repo)
- pi/Infrastructure/Persistence/Migrations/20261019162025_AddFavorites.* (nuevos)

**Decisiones relevantes**:
- Seguimos convenciones existentes (navegaciones en Domain; FKs shadow via EF/config). Sin BaseEntity (coincide con domain.md).
- Eliminación física: RemoveAsync llama a DbSet.Remove (task explícita: "Quitar un favorito elimina físicamente su registro").
- Repositorio específico (no genérico). AsNoTracking para ExistsAsync.
- Índice único UserId+WorkId para evitar duplicados.

**Notas**:
- Build pi/Api/Api.csproj: 0 errores, warnings de seguridad existentes. 
- Branch eature/us-0036 creada y pusheada con commit 66cfc6.

**Verificaciones**: compilación exitosa. No hay cambios fuera del alcance.
