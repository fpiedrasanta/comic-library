# TASK-API-0324 — Informar pertenencia a listas personales en los resultados de Works

## Objetivo

Incorporar en las respuestas de los endpoints de Works un indicador que permita conocer si cada obra pertenece a una o más listas personales del usuario autenticado.

## Endpoints afectados

- `GET /api/works`
- `GET /api/users/me/reading-history`
- `GET /api/works/recommended`

El endpoint `/api/works` también se utiliza para el contexto de favoritos; no crear un endpoint paralelo ni duplicar lógica para ese contexto.

## Comportamiento funcional

Cada Work devuelto debe incluir un booleano que indique si pertenece a alguna lista personal del usuario autenticado.

- `true`: existe al menos un `WorkListItem` que relaciona la obra con una lista personal propiedad del usuario autenticado.
- `false`: no existe ninguna relación de ese tipo.

La comprobación debe considerar exclusivamente listas personales (`OwnerType = User`) cuyo propietario sea el usuario autenticado.

No considerar:
- listas del sistema;
- listas personales de otros usuarios;
- obras que no estén incluidas en ninguna lista personal propia.

## Requisitos técnicos

- Reutilizar las entidades, relaciones, repositorios y servicios existentes.
- Obtener la identidad desde el mecanismo de autenticación establecido por el proyecto.
- No aceptar un identificador de usuario enviado por el cliente para determinar la pertenencia.
- Evitar consultas individuales por cada Work y evitar el problema N+1.
- Resolver la pertenencia mediante una consulta eficiente compatible con los filtros, orden y paginación actuales.
- Mantener los contratos y el comportamiento existente de los tres endpoints, agregando únicamente el dato requerido.
- No duplicar lógica entre los endpoints.
- Mantener Clean Architecture y las convenciones existentes del proyecto.
- No implementar ni modificar la administración de listas personales ya cubierta por TASK-API-0319 a TASK-API-0323.

## Documentación

Actualizar la documentación de endpoints y los DTOs afectados. Actualizar también los documentos de servicios, repositorios y dominio únicamente si los cambios lo requieren.

Documentar el nombre definitivo del campo, su semántica y su comportamiento cuando el usuario no tiene listas personales.

## Pruebas

Agregar o actualizar pruebas para verificar:

- Work incluido en una lista personal propia: devuelve `true`.
- Work incluido en varias listas personales propias: devuelve `true`.
- Work no incluido en listas personales propias: devuelve `false`.
- Work incluido únicamente en una lista del sistema: devuelve `false`.
- Work incluido únicamente en listas de otro usuario: devuelve `false`.
- Los tres endpoints incluyen el campo.
- Los filtros, el orden, la paginación y el contenido existente siguen funcionando.
- No se generan consultas individuales por Work para calcular la pertenencia.
- No hay regresiones en las pruebas existentes.

## Fuera de alcance

- Crear el endpoint de consulta de listas personales para una obra; corresponde a TASK-API-0325.
- Crear, editar o eliminar listas personales.
- Agregar o quitar Works de listas.
- Cambiar el comportamiento de favoritos.
- Modificar la interfaz de Public Web.

## Criterios de aceptación

- Los tres endpoints devuelven el indicador de pertenencia a listas personales.
- El indicador refleja exclusivamente las listas personales del usuario autenticado.
- La implementación evita consultas N+1.
- Se conservan los contratos y comportamientos previos, salvo el nuevo campo.
- La documentación y las pruebas quedan actualizadas.
- Build y tests relevantes finalizan satisfactoriamente.

## Revisión final

Antes de cerrar:

- Verificar `communication.md` y las convenciones de Backend/API.
- Revisar contratos, DTOs, servicios, repositorios y dominio afectados.
- Confirmar que las pruebas cubren los tres endpoints y los límites entre listas personales y del sistema.
- Confirmar que no se modificaron funcionalidades ajenas al alcance.
- Documentar commits, pruebas, estado final y bloqueos pendientes.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Nuevo atributo de respuesta **`isInPersonalList`** (boolean) en los Works devueltos por `GET /api/works`,
  `GET /api/users/me/reading-history` y `GET /api/works/recommended`.
  - `true`: existe al menos un `WorkListItem` que relaciona la obra con una lista personal
    (`OwnerType = User`) del usuario autenticado.
  - `false`: no existe esa relación.
- Solo se consideran listas personales del usuario autenticado: **no** cuentan las listas del sistema ni las
  listas personales de otros usuarios.
- El atributo es **exclusivamente de respuesta**: no se agregó a ningún request ni se modificaron los
  parámetros, filtros, ordenamiento o paginación de los tres endpoints.
- La pertenencia se resuelve con **una única consulta por página**
  (`IWorkListItemRepository.GetPersonalWorkIdsAsync`), nunca con una consulta por Work. Es el mismo patrón que
  ya usa `isFavorite`, y comparte la lógica de mapeo (`WorkCardMapper`), de modo que los tres endpoints
  exponen el dato sin duplicar código.

**Qué se cambió**:
- `api/Application/DTOs/WorkCatalogDtos.cs`: `WorkCatalogItemDto.IsInPersonalList`.
- `api/Application/Helpers/WorkCardMapper.cs`: `ToCard(Work, WorkReadingProgress?, bool isFavorite, bool isInPersonalList)`.
- `api/Application/Interfaces/IWorkListItemRepository.cs` +
  `api/Infrastructure/Repositories/WorkListItemRepository.cs`: `GetPersonalWorkIdsAsync`.
- `api/Application/Services/WorkService.cs`, `ReadingHistoryService.cs`, `RecommendedWorksService.cs`: resolución
  batched del estado y mapeo del nuevo atributo.
- `project/endpoints/endpoints-works.md`, `endpoints-reading-history.md`, `endpoints-recommended-works.md`,
  `project/services.md`, `project/repositories.md`, `project/repositories/repositories-catalog.md`.

**Decisiones relevantes**:
- El nombre definitivo del campo es **`isInPersonalList`** (propiedad `IsInPersonalList` en el DTO), en línea con
  `isFavorite`. Semántica: `true` cuando la obra pertenece a **una o más** listas personales del usuario
  autenticado. Cuando el usuario no tiene listas personales, el valor es siempre `false` (no es `null` ni
  desaparece del contrato).
- Se reutiliza el DTO y el mapper existentes de la WorkCard, de modo que el atributo llega a los tres endpoints
  con un solo cambio y sin duplicar la lógica de pertenencia.
- La resolución se hace con una consulta `DISTINCT` sobre `WorkListItems` filtrando por
  `WorkList.OwnerType = User` y `WorkList.Owner.Id = userId`: las listas del sistema y las de otros usuarios
  quedan excluidas por la propia consulta, no por un filtro en memoria.

**Notas**:
- Commit: `db2c712`. Trabajo directo sobre `main` (fast-forward), según la indicación de no crear rama.
- Tests: `PersonalListMembershipIntegrationTests` cubre obra en una lista propia (`true`), en varias listas
  propias (`true`), sin listas propias (`false`), solo en lista del sistema (`false`), solo en lista de otro
  usuario (`false`), y la presencia del atributo en catálogo, historial y recomendados.
- La suite completa queda en **449/449 pass** (435 previos + 14 nuevos), sin regresiones: los filtros, el orden y
  la paginación de los tres endpoints siguen verificados por las pruebas existentes.
- No se modificó ninguna funcionalidad ajena al alcance: no se tocó la administración de listas personales
  (TASK-API-0319..0323) ni el comportamiento de favoritos.
