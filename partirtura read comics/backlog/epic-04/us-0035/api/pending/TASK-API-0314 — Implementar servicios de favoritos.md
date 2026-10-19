# TASK-API-0314 — Implementar servicios de favoritos

## Objetivo

Implementar la lógica de aplicación para agregar y quitar Works de los favoritos del usuario autenticado.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, `services.md`, las reglas de servicios del Backend/API, la US-0035 y `TASK-API-0313`.

Inspeccionar los servicios existentes de Works y las convenciones de inyección de dependencias y manejo de errores.

## Alcance

Implementar los casos de uso requeridos por los endpoints:

- Agregar un Work a favoritos.
- Quitar un Work de favoritos.

Los servicios deben validar la existencia del Work y resolver el usuario desde el contexto autenticado conforme a las abstracciones existentes.

## Reglas de negocio

- No permitir favoritos duplicados.
- Agregar un favorito equivale a crear el registro.
- Quitar un favorito equivale a eliminar físicamente el registro.
- No permitir que un usuario modifique favoritos de otro.
- No alterar el progreso de lectura, el historial ni las listas personales.
- Utilizar `IUnitOfWork` y las transacciones existentes conforme a las convenciones del proyecto.
- No introducir un `Repository<T>` genérico ni duplicar mecanismos existentes.

## Dependencias

- US-0035.
- TASK-API-0313.
- Abstracciones de dominio y persistencia existentes.

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

- Ambos casos de uso funcionan a través de servicios.
- Se valida el Work y se respeta el usuario autenticado.
- No se generan duplicados.
- La eliminación es física.
- Los errores se traducen mediante los mecanismos existentes.
- No hay lógica de persistencia en los controladores.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, validaciones y bloqueos.
