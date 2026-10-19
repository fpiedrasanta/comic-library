# TASK-API-0313 — Definir endpoints de gestión de favoritos

## Objetivo

Definir e implementar la capa de endpoints para agregar y quitar Works de los favoritos del usuario autenticado.

## Contexto obligatorio

Antes de comenzar, leer:

- `communication.md`
- `endpoints.md`
- La documentación vigente del dominio Work y User.
- Los servicios y endpoints existentes relacionados con Works y el usuario autenticado.
- La US-0035 — Gestionar favoritos.

## Alcance

Implementar dos operaciones:

- Agregar un Work a favoritos.
- Quitar un Work de favoritos mediante eliminación física.

La identidad del usuario debe obtenerse del contexto de autenticación existente. El cliente no debe enviar un UserId para determinar a quién pertenece la operación.

Definir las rutas y los métodos HTTP siguiendo las convenciones existentes de `endpoints.md`.

Los endpoints deben delegar la lógica de negocio en servicios. No implementar consultas ni persistencia directamente en los controladores.

## Reglas

- Solo usuarios autenticados pueden acceder a estas operaciones.
- Un Work no puede duplicarse en los favoritos del mismo usuario.
- Quitar un favorito elimina físicamente su registro.
- No modificar el Work ni el estado de lectura.
- Mantener el formato de respuesta y errores establecido por el proyecto.

## Dependencias

- US-0035.
- Servicios y repositorios existentes.
- Contratos vigentes de autenticación y Works.

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

- Existen las dos operaciones.
- La identidad del usuario se obtiene de la autenticación.
- Las rutas y respuestas respetan los contratos existentes.
- No se introduce lógica de persistencia en los controladores.
- Los errores se gestionan conforme a las convenciones del proyecto.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, validaciones y bloqueos.
