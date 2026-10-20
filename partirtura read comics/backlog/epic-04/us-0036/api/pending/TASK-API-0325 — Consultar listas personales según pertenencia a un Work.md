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
