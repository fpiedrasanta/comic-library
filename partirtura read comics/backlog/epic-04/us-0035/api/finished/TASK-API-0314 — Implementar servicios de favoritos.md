# TASK-API-0314 â€” Implementar servicios de favoritos

## Objetivo

Implementar la lÃ³gica de aplicaciÃ³n para agregar y quitar Works de los favoritos del usuario autenticado.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, `services.md`, las reglas de servicios del Backend/API, la US-0035 y `TASK-API-0313`.

Inspeccionar los servicios existentes de Works y las convenciones de inyecciÃ³n de dependencias y manejo de errores.

## Alcance

Implementar los casos de uso requeridos por los endpoints:

- Agregar un Work a favoritos.
- Quitar un Work de favoritos.

Los servicios deben validar la existencia del Work y resolver el usuario desde el contexto autenticado conforme a las abstracciones existentes.

## Reglas de negocio

- No permitir favoritos duplicados.
- Agregar un favorito equivale a crear el registro.
- Quitar un favorito equivale a eliminar fÃ­sicamente el registro.
- No permitir que un usuario modifique favoritos de otro.
- No alterar el progreso de lectura, el historial ni las listas personales.
- Utilizar `IUnitOfWork` y las transacciones existentes conforme a las convenciones del proyecto.
- No introducir un `Repository<T>` genÃ©rico ni duplicar mecanismos existentes.

## Dependencias

- US-0035.
- TASK-API-0313.
- Abstracciones de dominio y persistencia existentes.

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

- Ambos casos de uso funcionan a travÃ©s de servicios.
- Se valida el Work y se respeta el usuario autenticado.
- No se generan duplicados.
- La eliminaciÃ³n es fÃ­sica.
- Los errores se traducen mediante los mecanismos existentes.
- No hay lÃ³gica de persistencia en los controladores.

## Resultado de ejecuciÃ³n

Registrar rama, commit, archivos modificados, validaciones y bloqueos.
## Resultado de ejecución

**Estado**: Cumplido.

**Qué se implementó**:
- IFavoriteService y FavoriteService con AddFavoriteAsync(workId, userId, cancellationToken) y RemoveFavoriteAsync(workId, userId, cancellationToken).
- Validaciones: existencia de usuario; existencia + IsActive de Work; duplicados (BusinessConflictException); favorito inexistente al quitar (BusinessNotFoundException). Uso de UoW + SaveChangesAsync (transaccional).

**Qué se cambió**:
- pi/Application/Interfaces/IFavoriteService.cs (nuevo)
- pi/Application/Services/FavoriteService.cs (nuevo)
- pi/Api/Program.cs (registro DI AddScoped<IFavoriteService,FavoriteService>)

**Decisiones**: elimina físicamente (Remove llama a repo.Remove); no lógica en controllers; transacciones vía UoW/SaveChangesAsync; errores con Domain.Exceptions.
