# TASK-API-0204 — Implementar dominio de Roles

## Ejecución

### Lo que se implementó

El dominio de `Role` ya existía y cumplía con todos los requisitos. Se verificó que:

- `Domain/Entities/Role.cs` tiene `Id`, `Name`, `IsActive`, `CreatedAt`
- `Infrastructure/Persistence/Configurations/RoleConfiguration.cs` enforce: Name required, Name unique, IsActive default true, CreatedAt required
- `Domain/Entities/PersonByRole.cs` referencia `Role` sin dependencia del estado activo/inactivo de Role
- `project/domain/domain-catalog.md` documenta Role correctamente

### Lo que se cambió

Ninguno. El dominio ya estaba completo.

### Decisiones relevantes

Ninguna. No se requirió ningún cambio en el dominio.

## Original

Implementar o adaptar el modelo de dominio Role respetando las convenciones existentes.

Debe contemplar:

* `Id`
* `Name`
* `IsActive`
* `CreatedAt`

Reglas:

* `Name` es obligatorio.
* `Name` debe ser único.
* `Id` es inmutable.
* `IsActive` representa la baja lógica.
* No implementar eliminación física.
* La desactivación de un Role no debe eliminar ni modificar relaciones existentes con `PersonByRole`.
* No agregar atributos fuera del alcance de US-0020.

## Compatibilidad

Revisar el uso actual de `Role`, especialmente:

* `PersonByRole`
* relaciones con `Work`
* funcionalidades existentes que ya utilicen Roles.

Reutilizar el modelo existente si corresponde. No duplicar entidades ni relaciones.

## Validación

Verificar que:

* El dominio compile.
* Las relaciones existentes con `PersonByRole` continúen siendo válidas.
* El modelo respete las convenciones documentadas.
* `project/domain.md` refleje el modelo final.

No implementar repositorios, servicios, endpoints ni Dashboard en esta task.