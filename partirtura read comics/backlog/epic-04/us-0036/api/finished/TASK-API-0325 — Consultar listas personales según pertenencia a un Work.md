# TASK-API-0325 — Consultar listas personales según pertenencia a un Work

## Objetivo

Implementar un endpoint que devuelva las listas personales del usuario autenticado para permitir consultar si una obra pertenece a cada lista.

El endpoint será utilizado por Public Web para mostrar un selector de listas con sus casillas de selección y permitir agregar o quitar una obra de cada lista.

## Endpoint

Agregar una operación de consulta bajo la ruta existente de listas personales:

`GET /api/users/me/lists`

### Parámetros de consulta

- `search`: texto opcional para filtrar por nombre de lista.
- `pageSize`: cantidad máxima de listas a devolver.
- `workId`: identificador del Work cuya pertenencia se desea comprobar.

Utilizar los tipos, validaciones, respuesta envolvente y convenciones de errores que ya establece el proyecto.

No aceptar un identificador de usuario en la solicitud. El propietario se obtiene de la identidad autenticada.

## Alcance de los resultados

Devolver exclusivamente listas personales del usuario autenticado.

Cada elemento debe incluir los datos necesarios para identificar y mostrar la lista, junto con un booleano que indique si el Work solicitado pertenece a ella.

- `true`: el Work está incluido en esa lista personal.
- `false`: el Work no está incluido en esa lista personal.

El nombre definitivo del campo debe seguir las convenciones de los DTOs existentes y quedar documentado.

No incluir listas del sistema ni listas personales de otros usuarios.

## Búsqueda y orden

Aplicar el filtro `search` sobre el nombre de la lista, siguiendo las convenciones existentes para búsquedas de texto.

Ordenar los resultados de la siguiente manera:

1. Primero, las listas que contienen el Work indicado por `workId`.
2. Después, las listas que no contienen ese Work.
3. Dentro de cada grupo, ordenar por nombre ascendente.

La búsqueda, el cálculo de pertenencia, el orden y el límite `pageSize` deben aplicarse en la base de datos antes de materializar los resultados.

No agregar un parámetro `currentPage` sin que el contrato funcional lo requiera. `pageSize` establece el límite de resultados de esta operación.

## Requisitos técnicos

- Reutilizar las entidades y relaciones existentes de listas personales y `WorkListItem`.
- Restringir la consulta a las listas personales del usuario autenticado.
- No confiar en identificadores de propietario enviados por el cliente.
- Evitar consultas individuales por cada lista.
- Mantener Clean Architecture y las convenciones de controladores, servicios, repositorios y DTOs.
- Aplicar los mecanismos de validación y errores existentes para parámetros inválidos y entidades inexistentes.
- No modificar el comportamiento de las listas del sistema.
- No modificar las operaciones existentes de creación, edición, eliminación, incorporación, eliminación de obras u ordenamiento de listas.

## Integración con las operaciones existentes

El resultado permitirá que Public Web determine el estado inicial de cada casilla de selección.

La interfaz podrá utilizar las operaciones existentes:

- `POST /api/users/me/lists/{listId}/works` para incorporar un Work.
- `DELETE /api/users/me/lists/{listId}/works/{workId}` para quitarlo.

No implementar lógica de interfaz en Backend/API ni duplicar las operaciones existentes.

## Documentación

Actualizar la documentación de endpoints y los documentos de servicios, repositorios y dominio si corresponde.

Documentar:

- ruta y método;
- parámetros y validaciones;
- estructura de respuesta;
- semántica del booleano de pertenencia;
- regla de ordenamiento;
- alcance exclusivo sobre listas personales;
- errores posibles.

## Pruebas

Agregar pruebas para verificar:

- Solo se devuelven listas personales del usuario autenticado.
- Nunca se incluyen listas del sistema.
- Nunca se incluyen listas de otros usuarios.
- Las listas que contienen el Work aparecen primero.
- Las listas de cada grupo están ordenadas por nombre ascendente.
- `search` filtra por nombre sin alterar el orden requerido.
- `pageSize` limita correctamente los resultados.
- La pertenencia se calcula correctamente para cada lista.
- Una obra que no está en ninguna lista devuelve `false` para todas las listas.
- La operación no modifica datos.
- Los parámetros inválidos se gestionan según las convenciones del proyecto.
- La consulta no genera consultas N+1.
- No hay regresiones en los tests existentes.

## Fuera de alcance

- Modificar los endpoints de Works, historial de lectura o recomendados; corresponde a TASK-API-0324.
- Crear, editar o eliminar listas personales.
- Agregar o quitar Works de listas.
- Reordenar los Works de una lista.
- Incluir listas del sistema.
- Modificar la interfaz de Public Web.

## Criterios de aceptación

- Existe el endpoint de consulta de listas personales por `search`, `pageSize` y `workId`.
- La respuesta incluye el indicador de pertenencia para cada lista.
- Los resultados pertenecen exclusivamente al usuario autenticado.
- El orden respeta pertenencia primero y nombre ascendente dentro de cada grupo.
- Búsqueda, orden y límite se resuelven eficientemente en la base de datos.
- La documentación y las pruebas quedan actualizadas.
- Build y tests relevantes finalizan satisfactoriamente.

## Revisión final

Antes de cerrar:

- Verificar `communication.md` y las convenciones de Backend/API.
- Revisar el contrato y la implementación en las capas afectadas.
- Confirmar el aislamiento por usuario, el orden y los límites de consulta.
- Confirmar que no se modificaron funcionalidades ajenas al alcance.
- Documentar commits, pruebas, estado final y bloqueos pendientes.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Nueva operación de consulta `GET /api/users/me/lists` con los parámetros de query `search` (opcional),
  `pageSize` (opcional, por defecto `PaginationGuard.DefaultPageSize` = 12, máximo 50) y `workId` (opcional).
- Devuelve **exclusivamente** las listas personales del usuario autenticado. Cada elemento incluye los datos de
  la lista (id, nombre, descripción, color, portada y cantidad de obras) y el booleano **`containsWork`**:
  `true` cuando el Work de `workId` pertenece a esa lista, `false` cuando no.
- Orden: primero las listas que contienen el Work, después las que no, y dentro de cada grupo por nombre
  ascendente. El filtro `search` no altera ese orden.
- La búsqueda, el cálculo de pertenencia, el orden y el límite `pageSize` se aplican **en la base de datos**
  antes de materializar los resultados (`IWorkListRepository.GetPersonalWithMembershipAsync`): una sola
  consulta, sin N+1.
- El propietario se obtiene de la identidad autenticada; la solicitud no acepta ningún identificador de
  usuario. La operación es de solo lectura.

**Qué se cambió**:
- `api/Api/Controllers/MyListsController.cs`: `GET api/users/me/lists` (la acción de una sola lista pasó a
  llamarse `GetById` para que `CreatedAtAction` no quedara ambiguo).
- `api/Application/DTOs/PersonalListDtos.cs`: `GetPersonalListsRequest` y `PersonalListMembershipDto`.
- `api/Application/DTOs/PersonalListMembershipData.cs` (nuevo): proyección de la consulta.
- `api/Application/Interfaces/IPersonalListService.cs` y
  `api/Application/Services/PersonalListService.cs`: `GetWithMembershipAsync`.
- `api/Application/Interfaces/IWorkListRepository.cs` y
  `api/Infrastructure/Repositories/WorkListRepository.cs`: `GetPersonalWithMembershipAsync`.
- `project/endpoints/endpoints-personal-lists.md` (sección del endpoint), `project/services.md`,
  `project/services/services-catalog.md`, `project/repositories.md`,
  `project/repositories/repositories-catalog.md`.

**Decisiones relevantes**:
- El nombre definitivo del booleano es **`containsWork`** (propiedad `ContainsWork` en el DTO), en línea con la
  convención camelCase de los DTOs del proyecto. Semántica: `true` cuando el Work solicitado pertenece a esa
  lista personal.
- La respuesta no es paginada porque el contrato funcional no requiere `currentPage`: `pageSize` es el límite
  de resultados. Se usa `ApiResponse<IReadOnlyList<PersonalListMembershipDto>>`.
- `workId` es opcional: si no se envía, `containsWork` es `false` en todas las listas (no se consulta ninguna
  pertenencia).
- `pageSize` con valor cero o negativo devuelve 422 (`ValidationException`), el mismo mecanismo de validación
  del proyecto; los valores mayores que el máximo se limitan a `PaginationGuard.MaxPageSize`.
- El orden se aplica **antes** de la proyección: EF Core no puede ordenar por una propiedad del record
  proyectado, así que la consulta ordena por la expresión de pertenencia y luego por nombre, y recién después
  proyecta.

**Notas**:
- Commit: `db2c712`. Trabajo directo sobre `main` (fast-forward), según la indicación de no crear rama.
- Tests: `PersonalListMembershipIntegrationTests` cubre que solo se devuelven listas personales del usuario
  autenticado, que nunca se incluyen listas del sistema ni de otros usuarios, que las listas que contienen el
  Work aparecen primero, que dentro de cada grupo van por nombre ascendente, que `search` filtra sin alterar el
  orden, que `pageSize` limita los resultados, que la pertenencia se calcula por lista y que un `pageSize`
  inválido devuelve 422. `MyListsControllerContractTests` verifica la ruta de colección y la de una sola lista.
- La suite completa queda en **449/449 pass** (435 previos + 14 nuevos), sin regresiones.
- No se modificó ninguna funcionalidad ajena al alcance: ni la administración de listas personales
  (TASK-API-0319..0323) ni los endpoints de Works, historial o recomendados (TASK-API-0324).
