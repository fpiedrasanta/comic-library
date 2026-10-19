# TASK-API-0313 â€” Definir endpoints de gestiÃ³n de favoritos

## Objetivo

Definir e implementar la capa de endpoints para agregar y quitar Works de los favoritos del usuario autenticado.

## Contexto obligatorio

Antes de comenzar, leer:

- `communication.md`
- `endpoints.md`
- La documentaciÃ³n vigente del dominio Work y User.
- Los servicios y endpoints existentes relacionados con Works y el usuario autenticado.
- La US-0035 â€” Gestionar favoritos.

## Alcance

Implementar dos operaciones:

- Agregar un Work a favoritos.
- Quitar un Work de favoritos mediante eliminaciÃ³n fÃ­sica.

La identidad del usuario debe obtenerse del contexto de autenticaciÃ³n existente. El cliente no debe enviar un UserId para determinar a quiÃ©n pertenece la operaciÃ³n.

Definir las rutas y los mÃ©todos HTTP siguiendo las convenciones existentes de `endpoints.md`.

Los endpoints deben delegar la lÃ³gica de negocio en servicios. No implementar consultas ni persistencia directamente en los controladores.

## Reglas

- Solo usuarios autenticados pueden acceder a estas operaciones.
- Un Work no puede duplicarse en los favoritos del mismo usuario.
- Quitar un favorito elimina fÃ­sicamente su registro.
- No modificar el Work ni el estado de lectura.
- Mantener el formato de respuesta y errores establecido por el proyecto.

## Dependencias

- US-0035.
- Servicios y repositorios existentes.
- Contratos vigentes de autenticaciÃ³n y Works.

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

- Existen las dos operaciones.
- La identidad del usuario se obtiene de la autenticaciÃ³n.
- Las rutas y respuestas respetan los contratos existentes.
- No se introduce lÃ³gica de persistencia en los controladores.
- Los errores se gestionan conforme a las convenciones del proyecto.

## Resultado de ejecuciÃ³n

Registrar rama, commit, archivos modificados, validaciones y bloqueos.
## Resultado de ejecución

**Estado**: Cumplido.

**Qué se implementó**:
- FavoritesController con rutas [Route("api/favorites"), [Authorize], métodos POST {workId} y DELETE {workId}.
- Obtención de userId desde claims (NameIdentifier o sub), devuelve 401 si inválido.
- Delegación a IFavoriteService (sin lógica de persistencia en controlador).

**Qué se cambió**:
- pi/Api/Controllers/FavoritesController.cs (nuevo)
- pi/Api/Program.cs ya registra IFavoriteService.

**Notas**: build OK. Errores centralizados por middleware existente.
