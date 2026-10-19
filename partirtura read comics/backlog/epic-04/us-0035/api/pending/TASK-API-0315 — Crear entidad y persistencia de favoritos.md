# TASK-API-0315 — Crear entidad y persistencia de favoritos

## Objetivo

Implementar el modelo de dominio, la persistencia y las consultas necesarias para gestionar favoritos.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, `services.md`, `domain.md`, las reglas de dominio y repositorios, la configuración de EF Core y la US-0035.

Inspeccionar las entidades User y Work, sus relaciones, `IUnitOfWork`, los repositorios existentes y las convenciones de migraciones.

## Entidad Favorite

Crear una entidad con estas propiedades:

- `Id`
- `User`
- `Work`
- `CreatedAt`

**No crear propiedades `UserId` ni `WorkId` en la entidad de dominio.** Las relaciones deben expresarse mediante objetos de navegación, siguiendo las convenciones existentes del proyecto.

## Persistencia

- Configurar las relaciones con User y Work mediante el mecanismo de persistencia existente.
- Impedir duplicados para la combinación User–Work mediante una restricción de unicidad en base de datos.
- Implementar el repositorio específico que necesite el caso de uso.
- Permitir consultar si un Work es favorito de un usuario.
- Permitir consultar los favoritos del usuario.
- Permitir agregar y eliminar físicamente registros.
- Integrar la entidad con `IUnitOfWork` y el registro de dependencias existente.
- Preparar la migración de EF Core según las convenciones del proyecto.

No introducir un repositorio genérico ni mecanismos paralelos de persistencia.

## Dependencias

- US-0035.
- TASK-API-0314.
- Modelo actual de User y Work.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036"`

   Si existe: `git switch feature/us-0036` → `git merge main`.

   Si no existe: `git switch -c feature/us-0036`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear uno o más commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.

## Criterios de aceptación

- La entidad contiene únicamente las propiedades de dominio definidas.
- Las relaciones usan objetos de navegación en el dominio.
- La base de datos impide duplicados por usuario y Work.
- Agregar, consultar y quitar favoritos funciona a través del repositorio.
- La eliminación es física.
- La migración es válida y respeta las convenciones existentes.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, migración, validaciones y bloqueos.
