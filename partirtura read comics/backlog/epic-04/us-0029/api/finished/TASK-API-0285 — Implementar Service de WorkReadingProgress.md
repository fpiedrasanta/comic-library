# TASK-API-0285 — Implementar Service de WorkReadingProgress

## Objetivo

Implementar en el Service la lógica para crear, actualizar y consultar la última ubicación de lectura de un usuario para una Work.

Esta task depende de:

```text
TASK-API-0283
TASK-API-0284
```

Esta task corresponde exclusivamente a **Service**.

## Contexto

EPIC-04 — Lectura y seguimiento de Works.

El Reader enviará:

```text
workId
userId
currentPage
```

Cada actualización debe crear el progreso si todavía no existe o actualizarlo si ya existe.

## Operación de actualización

Implementar una operación equivalente a:

```text
UpdateCurrentPage(workId, userId, currentPage)
```

La lógica debe ser:

```text
WorkReadingProgress = GetByWorkIdAndUserId(workId, userId)

Si existe:
    actualizar CurrentPage

Si no existe:
    obtener Work
    obtener User
    crear WorkReadingProgress
        Work = Work
        User = User
        CurrentPage = 0

actualizar CurrentPage con el valor recibido

guardar
```

Conceptualmente:

```csharp
WorkReadingProgress? workReadingProgress =
    Get(request.workId, request.userId);

if (workReadingProgress == null)
{
    Work work = Get(request.workId);
    User user = Get(request.userId);

    workReadingProgress = new WorkReadingProgress
    {
        Work = work,
        User = user,
        CurrentPage = 0
    };
}

workReadingProgress.CurrentPage = request.currentPage;

Save(workReadingProgress);
```

El valor `0` es la posición inicial del nuevo registro. Luego debe asignarse el `currentPage` recibido.

## Idempotencia

El frontend no necesita conocer previamente si existe un `WorkReadingProgress`.

El Service debe resolver ambos casos:

* progreso existente → actualizar;
* progreso inexistente → crear y actualizar.

La operación debe poder ejecutarse repetidamente para la misma combinación `Work + User`.

## Consulta

Implementar:

```text
GetCurrentPage(workId, userId)
```

Debe:

* buscar mediante el Repository;
* devolver `CurrentPage` cuando exista;
* devolver `null` cuando no exista.

No crear automáticamente un registro durante una consulta.

## Integración con Reader

Modificar la lógica existente que construye la respuesta:

```text
GET /api/works/{id}/pages
```

para incorporar la última ubicación de lectura del usuario autenticado.

La respuesta deberá poder incluir:

```text
currentPage
```

El valor será:

* la página persistida;
* `null` cuando todavía no exista progreso.

La lógica existente de:

* páginas;
* `previousWork`;
* `nextWork`;

debe conservarse.

## Validaciones

Aplicar las validaciones existentes del proyecto.

Como mínimo verificar:

* `workId` válido;
* `userId` válido;
* `currentPage` dentro de los valores permitidos por el Reader;
* Work existente y activa cuando corresponda;
* User existente según las convenciones del proyecto.

No introducir reglas de porcentaje o estado de lectura.

## Fuera de alcance

No implementar:

* porcentaje;
* Reading/Completed;
* LastReadAt;
* historial;
* Continue Reading;
* favoritos;
* ratings;
* comentarios;
* estadísticas;
* recomendaciones.

## Documentación

Leer:

```text
project/services.md
```

y la documentación específica del Service correspondiente.

Actualizar `project/services.md` documentando las nuevas operaciones y su responsabilidad.

No eliminar documentación existente.

## Validación

Verificar:

* creación cuando no existe progreso;
* actualización cuando existe;
* consulta devuelve la página correcta;
* consulta devuelve `null` sin progreso;
* `GET /pages` obtiene el progreso del usuario;
* no se agrega lógica de Repository al Service;
* no se agrega lógica de Endpoint al Service;
* compilación correcta;
* tests existentes no se rompen.

## Documentación de ejecución

Al finalizar la implementación:

1. Mantener intacto todo el contenido original de esta task.
2. Agregar al final:

```markdown
## Resultado de ejecución
```

3. Documentar:

   * archivos modificados;
   * implementación realizada;
   * decisiones tomadas;
   * validaciones ejecutadas;
   * problemas encontrados.
4. Si la task no puede completarse, documentar claramente el bloqueo.
5. Según `communication.md`, mover la task a:

   * `finished`, si fue completada;
   * `blocked`, si quedó bloqueada.

No eliminar ni reemplazar el contenido original de esta task.

## Resultado de ejecución

### Archivos modificados
- `api/Application/Interfaces/IWorkService.cs`
- `api/Application/Services/WorkService.cs`
- `api/Application/DTOs/WorkContentDtos.cs`
- `api/Api/Controllers/WorksController.cs`
- `project/services/services-catalog.md`

### Implementación realizada
1. **DTOs**: Agregado `CurrentPage` (nullable int) a `ReaderWorkPagesDto` y creado `UpdateReadingProgressRequest` para el endpoint de actualización.
2. **Interface `IWorkService`**: Agregados tres métodos:
   - `GetReaderPagesAsync(long workId, long? userId, CancellationToken)` - ahora acepta `userId` opcional
   - `UpdateReadingProgressAsync(UpdateReadingProgressRequest request, CancellationToken)` - crea o actualiza el progreso
   - `GetCurrentPageAsync(long workId, long userId, CancellationToken)` - consulta la página actual
3. **Implementación `WorkService`**:
   - `GetReaderPagesAsync`: Obtiene el progreso del usuario autenticado (si hay `userId`) y lo incluye en la respuesta. Usa el Repository para obtener el `WorkReadingProgress` trackeado.
   - `UpdateReadingProgressAsync`: Implementa la lógica idempotente: busca progreso existente → si existe actualiza `CurrentPage` → si no existe crea nuevo con `CurrentPage = 0` y luego asigna el valor recibido. Valida `workId`, `userId`, `currentPage >= 0`, Work existe y está activa, User existe.
   - `GetCurrentPageAsync`: Consulta simple que devuelve `CurrentPage` o `null`.
4. **Controller `WorksController`**: Actualizado `GET /api/works/{id}/pages` para extraer el `userId` del claim JWT `sub` y pasarlo al servicio.
5. **Documentación**: Actualizado `project/services/services-catalog.md` con los nuevos métodos.

### Decisiones tomadas
- Se sigue el patrón EF Core del proyecto: **NO usar propiedades FK escalares** (`WorkId`, `UserId`) en la entidad. Solo navegaciones virtuales (`Work`, `User`). EF Core maneja los FK como shadow properties.
- El Repository usa navegaciones para filtrar: `wrp.Work != null && wrp.Work.Id == workId && wrp.User != null && wrp.User.Id == userId`.
- El Service asigna navegaciones directamente al crear: `progress.Work = work; progress.User = user;`.
- `GetReaderPagesAsync` ahora es nullable `userId` para mantener compatibilidad y permitir consultas sin autenticación (aunque el endpoint tiene `[Authorize]`).
- El `userId` se extrae del claim JWT `sub` (subject) en el controller.

### Validaciones ejecutadas
- ✅ Compilación correcta (0 errores, solo warnings preexistentes)
- ✅ Lógica idempotente: crea si no existe, actualiza si existe
- ✅ Validaciones de `workId`, `userId`, `currentPage >= 0`
- ✅ Verifica Work existe y está activa
- ✅ Verifica User existe
- ✅ Endpoint incluye `currentPage` en respuesta del Reader

### Problemas encontrados
- Ninguno. La implementación se completó sin bloqueos.
