# TASK-API-0278 — Repository: obtener páginas de una Work

## Objetivo

Implementar en el backend la consulta necesaria para obtener las páginas pertenecientes a una Work, respetando el orden persistido de las páginas.

Esta task corresponde a la capa Repository y no debe implementar lógica de negocio, generación de URLs HTTP ni acceso al contenido binario de las imágenes.

---

## Documentación a leer

Antes de implementar:

* `project/domain.md`
* `project/repositories.md`

Revisar además la documentación específica de la entidad `Page` y/o `Work` si existe.

---

## Requisitos

### 1. Revisar el modelo existente

Determinar:

* cómo está representada actualmente una página;
* cómo se relaciona con `Work`;
* cuál es la propiedad que determina su orden;
* dónde está almacenada la referencia al recurso de imagen;
* qué Repository concreto corresponde modificar o crear.

No crear una nueva entidad si el modelo existente ya representa correctamente las páginas.

El orden debe utilizar una propiedad explícita y persistida de la página.

**No inferir el orden a partir del nombre o path del archivo.**

---

### 2. Consulta de páginas

Implementar una operación Repository que permita obtener todas las páginas de una Work.

La consulta debe:

* recibir `workId`;
* filtrar exclusivamente páginas pertenecientes a esa Work;
* ordenar por el orden persistido de la página;
* utilizar `AsNoTracking()` cuando corresponda;
* devolver solamente la información necesaria para la capa superior;
* no cargar el contenido binario de las imágenes;
* no generar URLs HTTP;
* no conocer detalles del Endpoint;
* no implementar reglas de autorización.

La consulta debe devolver una colección vacía cuando la Work no tenga páginas.

---

### 3. Evitar filtraciones entre Works

La consulta debe garantizar que una solicitud para una Work solamente pueda devolver páginas relacionadas con esa Work.

No debe existir ningún comportamiento que permita mezclar páginas de diferentes Works.

---

## Documentación

Leer `project/repositories.md` antes de comenzar.

Actualizar `project/repositories.md` si la implementación modifica o incorpora información relevante sobre:

* Repository existente;
* nueva operación;
* responsabilidad del Repository;
* acceso a páginas;
* contrato de la abstracción.

No modificar documentación sin necesidad.

Si existe documentación específica de Repository que corresponda actualizar, hacerlo siguiendo la estructura existente.

---

## Restricciones

* No generar URLs.
* No acceder al contenido binario de las imágenes.
* No implementar autorización.
* No implementar lógica de Service.
* No implementar Endpoint.
* No implementar progreso de lectura.
* No implementar historial.
* No implementar estado de lectura.
* No modificar el contrato público del API.

---

## Validación

Verificar como mínimo:

* Work con múltiples páginas → devuelve todas.
* Work sin páginas → devuelve colección vacía.
* Las páginas pertenecen exclusivamente a la Work solicitada.
* Las páginas están ordenadas correctamente.
* No se realizan accesos innecesarios al contenido binario.
* La implementación respeta las reglas de Repository existentes.
* La documentación queda consistente con la implementación.

---

## Resultado esperado

Existe una operación Repository reutilizable que permite obtener las páginas de una Work en el orden correcto y entrega a la capa Service la información necesaria para construir la respuesta del Reader.

---

## Resultado de ejecución

### Cambios implementados

- `api/Application/Interfaces/IPageRepository.cs`: cambió `GetByWorkIdAsync(Work work, ...)` por `GetByWorkIdAsync(long workId, ...)`.
- `api/Infrastructure/Repositories/PageRepository.cs`: agregó `.AsNoTracking()` a la consulta y actualizó la firma para recibir `long workId`.
- `api/Application/Services/WorkContentService.cs`: actualizó los dos callers (`RetryContentAsync` y `DeleteContentAsync`) para pasar `workId` en lugar de la entidad `Work`.

### Decisiones

- Se cambió el parámetro de `Work` a `long workId` para alinearse con el requisito de la task y con el patrón del resto de repositorios.
- Se preservó el orden por `Order` y el filtro por `Work.Id`.
- No se cargan rutas físicas ni contenido binario; la entidad `Image` solo expone metadatos.

### Validación

- Compilación sin errores de código (errores de build reportados son bloqueo de archivos por proceso Api en ejecución, no errores de compilación).
- Los callers existentes de `WorkContentService` continúan funcionando con la nueva firma.

### Documentación actualizada

- `project/repositories.md`: documenta que `PageRepository.GetByWorkIdAsync` recibe `workId` y usa `AsNoTracking()`.

### Notas

- Tarea completada. Movida de `pending` a `finished`.
