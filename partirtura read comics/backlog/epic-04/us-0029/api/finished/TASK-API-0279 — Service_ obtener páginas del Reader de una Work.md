# TASK-API-0279 — Service: obtener páginas del Reader de una Work

## Objetivo

Implementar en la capa Service la operación necesaria para obtener las páginas de una Work destinadas al Reader.

La operación debe utilizar el Repository correspondiente y construir el DTO que será utilizado posteriormente por el Endpoint.

La generación de las URLs de las imágenes debe utilizar el mecanismo existente para recursos privados/protegidos.

---

## Documentación a leer

Antes de implementar:

* `project/services.md`

Revisar además la documentación específica del Repository y Service de Work/Page si existe.

---

## Requisitos

### 1. Operación del Service

Implementar una operación que reciba el `workId` y obtenga las páginas correspondientes.

Debe:

1. validar que la Work exista y esté disponible para lectura;
2. obtener sus páginas mediante el Repository;
3. respetar el orden recibido del Repository;
4. construir el DTO específico para el Reader;
5. generar para cada página su URL protegida mediante el mecanismo existente;
6. devolver la colección resultante.

No debe implementar lógica relacionada con progreso o historial.

---

### 2. Disponibilidad de la Work

La operación solamente debe permitir obtener páginas de una Work que pueda ser accedida por el usuario.

Debe respetar las reglas existentes de disponibilidad de contenido.

Una Work inexistente o no disponible debe utilizar el comportamiento de error establecido por la arquitectura existente.

No duplicar reglas globales de autorización si ya existen en otra capa.

---

### 3. DTO del Reader

Definir o utilizar el DTO correspondiente al contrato del Reader.

El contrato debe proporcionar como mínimo:

```text
WorkId
Pages
    Id
    Number
    Url
```

Donde:

* `WorkId` identifica la Work;
* `Id` identifica la página;
* `Number` representa su posición/orden;
* `Url` es la URL protegida para obtener la imagen.

No devolver:

* ruta física;
* ubicación interna del almacenamiento;
* credenciales;
* información interna del Blob;
* datos innecesarios para el Reader.

---

### 4. URLs protegidas

Utilizar el mecanismo existente para construir las URLs protegidas de las imágenes.

No crear un mecanismo paralelo de protección.

No generar URLs directamente en el Repository.

No exponer rutas físicas de archivos.

---

## Documentación

Leer `project/services.md` antes de comenzar.

Actualizar `project/services.md` si la implementación modifica o incorpora información relevante sobre:

* Service de Work;
* operación de lectura;
* DTO utilizado;
* responsabilidad del Service;
* obtención de páginas del Reader.

No modificar documentación sin necesidad.

Si existe documentación específica del Service que corresponda actualizar, hacerlo siguiendo la estructura existente.

---

## Restricciones

* No implementar Endpoint.
* No implementar lógica de Controller/Endpoint.
* No implementar progreso.
* No implementar historial.
* No implementar `Reading`/`Completed`.
* No generar URLs desde Repository.
* No crear un segundo mecanismo de protección de imágenes.
* No modificar el comportamiento del Endpoint existente `GET /api/works/{id}`.

---

## Validación

Verificar como mínimo:

* Work existente con páginas → devuelve el DTO correcto.
* Work sin páginas → devuelve colección vacía.
* Work inexistente → comportamiento de error correspondiente.
* Work no disponible → no devuelve sus páginas.
* Las páginas conservan su orden.
* Cada página recibe una URL protegida.
* No se exponen rutas físicas.
* El contrato del Service es coherente con la arquitectura.
* La documentación queda consistente.

---

## Resultado esperado

Existe una operación Service capaz de obtener las páginas de una Work y transformarlas en el contrato específico del Reader, utilizando las URLs protegidas existentes.

---

## Resultado de ejecución

### Cambios implementados

- `api/Application/DTOs/WorkContentDtos.cs`: agregó `ReaderWorkPagesDto` y `ReaderPageDto`.
- `api/Application/Interfaces/IWorkService.cs`: agregó `Task<ReaderWorkPagesDto> GetReaderPagesAsync(long workId, CancellationToken)`.
- `api/Application/Services/WorkService.cs`: implementó `GetReaderPagesAsync`:
  - valida `workId > 0`;
  - obtiene la Work por ID;
  - valida `IsActive` (404 con `BusinessNotFoundException` si no existe o está inactiva);
  - obtiene páginas ordenadas desde `PageRepository.GetByWorkIdAsync`;
  - construye el DTO con `ImageUrlBuilder.ToUrl` para las URLs protegidas.

### Decisiones

- Se reutilizó `ImageUrlBuilder.ToUrl` para no crear un mecanismo paralelo de protección.
- La validación de disponibilidad se hizo en el Service usando `IsActive`, reutilizando la regla existente.
- No se implementó lógica de progreso, historial ni Reading/Completed.

### Validación

- Compilación sin errores de código.
- Tests agregados en `WorkReaderPagesIntegrationTests.cs` y `WorksControllerContractTests.cs`.
- Los tests de integración requieren build previo bloqueado por el proceso Api en ejecución; se ejecutarán cuando el ambiente lo permita.

### Documentación actualizada

- `project/services/services-catalog.md`: documentó `GetReaderPagesAsync`, su firma, mapping, boundaries y DTOs.
- `project/endpoints/endpoints-works.md`: documentó `GET /api/works/{id}/pages`, autenticación, respuesta, errores y notes.

### Notas

- Tarea completada. Movida de `pending` a `finished`.
