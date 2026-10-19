# TASK-API-0320 — Crear, editar y eliminar listas personales

## Objetivo

Implementar las operaciones para crear, renombrar y eliminar físicamente listas personales del usuario autenticado.

## Operaciones

Implementar tres endpoints para:

1. Crear una lista indicando únicamente `Name`.
2. Editar el nombre de una lista personal existente.
3. Eliminar físicamente una lista personal junto con todos sus `WorkListItem`.

Las rutas, verbos HTTP y formatos de respuesta deben seguir las convenciones existentes del backend.

## Creación de una lista

Al crear una lista, inicializar sus propiedades de la siguiente manera:

| Propiedad | Valor |
|---|---|
| `Name` | Nombre recibido del frontend |
| `Description` | `Lista creada por {nombre de usuario}` |
| `Cover` | Imagen genérica predeterminada, persistida mediante el mecanismo existente de imágenes |
| `Color` | Color predeterminado de marca NEPS; utilizar azul salvo que exista una convención definida en el proyecto |
| `ListType` | Sin tipo asociado |
| `OwnerType` | `1` — usuario |
| `Owner` | Usuario autenticado |
| `Visibility` | `1` — privada |
| `IsActive` | `true` |
| `CreatedAt` | Fecha y hora UTC |

No recibir del frontend propiedades que deben definirse en el backend, como propietario, visibilidad, tipo o fecha de creación.

### Imagen predeterminada

- Localizar la imagen predeterminada existente en el proyecto.
- Leer el archivo desde disco y persistirlo mediante el flujo existente de imágenes, como si fuera una imagen recibida en la creación.
- La imagen persistida debe ser independiente para cada lista, de manera que una futura modificación individual no afecte las demás.
- No duplicar mecanismos de almacenamiento, validación ni acceso a imágenes.

### Tipo de lista

Las listas personales no tienen `ListType`. Revisar el modelo de dominio, la configuración de EF Core y las restricciones de base de datos para permitir esta ausencia sin asignar artificialmente un tipo del sistema. Mantener intactas las reglas de las listas existentes.

## Edición

- Recibir el identificador de la lista y el nuevo nombre.
- Modificar únicamente `Name`.
- Validar que la lista exista, sea personal y pertenezca al usuario autenticado.
- No permitir modificar listas del sistema mediante este endpoint.

## Eliminación

- Eliminar físicamente el `WorkList`.
- Eliminar físicamente todos sus `WorkListItem`.
- Ejecutar la operación de forma transaccional cuando corresponda.
- No eliminar las obras relacionadas ni afectar sus datos, otras listas, el progreso, las valoraciones, los comentarios o los favoritos.
- No permitir eliminar listas de otros usuarios ni listas del sistema.

## Criterios de aceptación

- Una lista nueva se persiste con todos los valores definidos.
- La portada se almacena mediante el mecanismo de imágenes existente y es independiente por lista.
- La lista queda asociada al usuario autenticado.
- La edición cambia solamente el nombre.
- La eliminación elimina la lista y sus detalles, sin eliminar las obras.
- Las operaciones no permiten modificar listas de otros usuarios.
- Se respetan las validaciones, errores y convenciones de respuesta del proyecto.

## Implementación

Revisar `domain.md`, `repositories.md`, `services.md`, `endpoints.md` y los contratos existentes. No introducir una arquitectura paralela ni duplicar lógica de persistencia.

## Git y ejecuciÃ³n

1. `git checkout main` â†’ `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036-api"`

   Si existe: `git switch feature/us-0036-api` â†’ `git merge main`.

   Si no existe: `git switch -c feature/us-0036-api`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilaciÃ³n y regresiones detectables.
6. Crear uno o mÃ¡s commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.