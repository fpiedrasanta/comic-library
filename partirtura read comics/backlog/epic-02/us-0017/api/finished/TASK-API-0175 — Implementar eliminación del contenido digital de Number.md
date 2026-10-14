# TASK-API-0175 — Implementar eliminación del contenido digital de Number

## Objetivo

Implementar la eliminación completa del contenido digital asociado a un `Number`.

La operación debe permitir que el administrador elimine las páginas procesadas y deje el Número nuevamente sin contenido digital, sin eliminar ni modificar la información propia del Número.

La eliminación del contenido digital es independiente de `Number.IsActive`.

## Alcance

La Task comprende:

- Endpoint administrativo para eliminar el contenido digital.
- Eliminación de las páginas asociadas al Número.
- Eliminación de las imágenes correspondientes a las páginas.
- Limpieza de los registros de `Page`.
- Actualización del estado del contenido a `Sin archivo`.
- Validación del estado actual del procesamiento.
- Protección contra eliminación durante un procesamiento activo.
- Mantenimiento de la metadata del Número.

## Endpoint

Implementar:

`DELETE /api/admin-numbers/{numberId}/content`

El endpoint debe:

1. Validar que el `Number` exista.
2. Validar autenticación.
3. Validar rol `Administrator`.
4. Validar que la operación sea válida según el estado actual del contenido.
5. Eliminar el contenido digital asociado.
6. Dejar el Número en estado `Sin archivo`.

La operación no debe eliminar el `Number`.

## Contenido a eliminar

Cuando se elimina el contenido digital deben eliminarse:

```text
Number
  │
  └── Page 1 ── Image
  │
  ├── Page 2 ── Image
  │
  ├── Page 3 ── Image
  │
  └── ...
```

Es decir:

- Los registros `Page`.
- Las imágenes correspondientes a esas páginas.
- Las referencias físicas o lógicas utilizadas para acceder a dichas imágenes.
- Cualquier información de procesamiento asociada al contenido que deba reiniciarse.

No deben eliminarse:

- `Number`.
- `PersonByRole`.
- `TagByNumber`.
- `Language`.
- `Number` metadata.
- Relaciones de continuidad.
- Ninguna otra relación editorial del Número.

## Estado posterior

Después de eliminar correctamente el contenido digital, el estado debe ser:

```text
Sin archivo
```

El Número puede continuar:

```text
IsActive = true
```

o:

```text
IsActive = false
```

La eliminación del contenido no modifica `IsActive`.

Ejemplo:

```text
Number.IsActive = true
Content = Finalizado OK

       ↓ DELETE content

Number.IsActive = true
Content = Sin archivo
```

## Procesamiento en curso

No debe eliminarse contenido mientras exista un procesamiento activo:

```text
Procesando
```

La operación debe rechazar la solicitud en este estado para evitar que un worker continúe escribiendo páginas mientras la operación de eliminación intenta eliminarlas.

El administrador deberá esperar a que el procesamiento termine o falle antes de poder eliminar el contenido.

No debe cancelarse el worker mediante esta operación.

## Estado `Error`

Si el contenido se encuentra en:

```text
Error
```

debe poder eliminarse.

El objetivo es permitir limpiar los restos de un procesamiento fallido y volver a iniciar el flujo desde cero.

Ejemplo:

```text
Error
  ↓
Eliminar contenido
  ↓
Sin archivo
  ↓
Cargar nuevo CBR
  ↓
Procesando
```

## Estado `Finalizado OK`

Si el contenido se encuentra en:

```text
Finalizado OK
```

debe poder eliminarse.

Esto permite eliminar una obra digital para posteriormente cargar nuevamente otro CBR.

## Estado `Sin archivo`

Si el Número ya se encuentra en:

```text
Sin archivo
```

la operación debe tratarse de acuerdo con las convenciones generales de la API para operaciones idempotentes.

No debe generar una eliminación inexistente ni producir información inconsistente.

## Archivo CBR original

El archivo CBR original no se conserva como contenido permanente.

Por lo tanto, la eliminación del contenido digital debe eliminar únicamente los recursos generados y persistidos para la lectura:

```text
Page
+
Image
```

No debe existir una dependencia funcional con un archivo borr original almacenado permanentemente.

## Consistencia

La operación debe evitar estados parciales.

No debe quedar un Número indicando:

```text
Sin archivo
```

cuando todavía existan páginas válidas asociadas.

Tampoco deben quedar páginas huérfanas después de una eliminación exitosa.

Debe garantizarse que:

```text
Number
   ↓
Pages
   ↓
Images
```

se encuentre consistente después de completar la operación.

Si la arquitectura de almacenamiento requiere operaciones separadas entre base de datos y almacenamiento físico, debe respetarse el mecanismo de consistencia definido por la aplicación.

## Imágenes privadas

Las imágenes de las páginas son recursos privados.

Su eliminación debe utilizar el mecanismo de almacenamiento de archivos existente en la aplicación.

No deben quedar accesibles mediante almacenamiento público directo después de eliminar el contenido.

## Seguridad

El endpoint debe requerir:

- Usuario autenticado.
- Rol `Administrator`.

No debe existir un endpoint público para eliminar contenido digital.

El `numberId` debe obtenerse desde la ruta y no debe poder ser reemplazado mediante un identificador alternativo incluido en el body.

## Servicios y repositorios

La lógica debe implementarse respetando la arquitectura existente.

El Controller no debe contener la lógica de eliminación.

La operación debe utilizar los servicios y repositorios correspondientes para:

- Obtener el Número.
- Obtener sus páginas.
- Eliminar las páginas.
- Eliminar las imágenes.
- Actualizar el estado del contenido.

La operación debe respetar el patrón de Unit of Work utilizado por la aplicación cuando corresponda.

## Relación con el procesamiento

La eliminación no debe iniciar un nuevo procesamiento.

Tampoco debe realizar automáticamente una nueva carga.

El flujo posterior queda explícitamente separado:

```text
Eliminar
   ↓
Sin archivo
   ↓
Cargar CBR
   ↓
Procesando
```

## Relación con `IsActive`

La eliminación del contenido no debe modificar:

```text
Number.IsActive
```

Son conceptos independientes.

Ejemplos válidos:

```text
IsActive = true
Content = Sin archivo
```

```text
IsActive = false
Content = Sin archivo
```

## Fuera de alcance

Esta Task no comprende:

- Carga de CBR.
- Procesamiento de CBR.
- Reintento de procesamiento.
- Consulta detallada del estado.
- Administración manual de páginas.
- Eliminación del Número.
- Eliminación de Personas.
- Eliminación de Tags.
- Modificación de continuidad.
- Modificación de metadata editorial.
- Cambio de `IsActive`.

Estas capacidades corresponden a otras Tasks de la US-0017.

## Documentación

Actualizar:

- `project/endpoints.md`
- `project/endpoints/endpoints-numbers.md`
- `project/services/services-application.md`
- `project/repositories.md`

Documentar:

- Endpoint de eliminación.
- Estados en los que está permitido eliminar.
- Estado resultante.
- Recursos eliminados.
- Independencia respecto de `IsActive`.

## Criterios de aceptación

- [x] Existe `DELETE /api/admin-numbers/{numberId}/content`
- [x] El endpoint requiere autenticación
- [x] El endpoint requiere rol `Administrator`
- [x] El endpoint valida que el Número exista
- [x] Se eliminan los registros `Page` asociados al Número
- [x] Se eliminan las imágenes correspondientes a las páginas
- [x] No se elimina el `Number`
- [x] No se eliminan Personas, Roles ni Tags asociados
- [x] No se modifica la continuidad del Número
- [x] No se modifica `Number.IsActive`
- [x] El estado del contenido pasa a `Sin archivo`
- [x] Puede eliminarse contenido en estado `Finalizado OK`
- [x] Puede eliminarse contenido en estado `Error`
- [x] No puede eliminarse contenido mientras se encuentre `Procesando`
- [x] Un procesamiento en curso no es cancelado por esta operación
- [x] Después de una eliminación exitosa no quedan páginas huérfanas
- [x] Después de una eliminación exitosa no quedan imágenes de páginas accesibles
- [x] El Número puede posteriormente recibir un nuevo CBR
- [x] La operación mantiene la consistencia entre base de datos y almacenamiento
- [x] La documentación queda actualizada
- [x] La solución compila correctamente

## Resultado

### Endpoint implementado

| Método | Ruta | Descripción |
|--------|------|-------------|
| DELETE | `/api/admin-numbers/{numberId}/content` | Eliminar contenido digital |

### Archivos reales (verificados 2026-09-03)

| Archivo | Descripción |
|---------|-------------|
| `api/Application/Services/NumberContentService.cs` | `DeleteContentAsync` (línea 107) |
| `api/Application/Interfaces/INumberContentService.cs` | Contrato del service |
| `api/Api/Controllers/AdminNumbersController.cs` | Endpoint `DeleteContent` (línea 165) |
| `project/endpoints.md` | Índice actualizado con el endpoint nuevo |
| `project/endpoints/endpoints-numbers.md` | Sección `DELETE .../content` documentada |

### Comportamiento

- Elimina registros `Page` asociados al Número.
- Elimina las `Image` correspondientes y sus archivos físicos.
- No elimina el `Number` ni sus relaciones (`PersonByRole`, `TagByNumber`, continuidad).
- No modifica `IsActive`.
- Estado del contenido pasa a `Missing` y `ContentError` se limpia.
- Idempotente cuando ya está en `Missing` (el foreach itera sobre `number.Pages` vacío y luego setea `Missing`).
- No permite eliminar mientras está `Processing` (devuelve `409` con `"No se puede eliminar el contenido mientras se está procesando."`).
- No cancela el worker en curso.

### Decisiones relevantes

- No cancela worker en curso.
- Operación idempotente si ya está en `Missing`.
- Consistencia entre DB y almacenamiento de archivos vía `UnitOfWork.SaveChangesAsync`.

### Build

- Exitoso: 0 errores en Domain/Application/Infrastructure/Api.
- Tests: **180/180 verdes**.

## Conclusiones del Backend Agent para el Front Agent

### `DELETE /api/admin-numbers/{numberId}/content`
- Auth: Bearer + rol `Administrator`.
- Request: solo `numberId` por ruta (no se acepta por body).
- 200: `{ success:true, message:"Contenido eliminado correctamente.", code:200, payload:null }`.
- Errors:
  - `401` no autenticado.
  - `403` sin rol `Administrator`.
  - `404` Number no existe.
  - `409` con mensaje `"No se puede eliminar el contenido mientras se está procesando."` si `ContentStatus === Processing`.

### Reglas para Front

1. **Estados que permiten eliminar:** `Missing` (idempotente), `Completed`, `Error`.
2. **Estado que NO permite eliminar:** `Processing` → mostrar mensaje "El contenido se está procesando. Esperá a que finalice para eliminarlo."
3. **Lo que se elimina:** Pages + Images + archivos físicos.
4. **Lo que NO se modifica:** el Number, `PersonByRole`, `TagByNumber`, `Language`, continuidad, `IsActive`.
5. **Estado final:** `Missing`.

### Diferencia clave respecto al retry (TASK-API-0174)

| Acción | Endpoint | Cuándo |
| --- | --- | --- |
| Reintentar mismo CBR/CBZ | `POST /{id}/content/retry` | solo cuando `Error` y se vuelve a subir el archivo |
| Eliminar contenido para reemplazarlo | `DELETE /{id}/content` → `POST /{id}/content` | cuando `Completed` y se quiere reemplazar |
| Eliminar para limpiar error | `DELETE /{id}/content` | cuando `Error` y NO se quiere reintentar |

### Tareas del Dashboard que se desbloquean

- `TASK-DASH-0077` (acción "Eliminar contenido digital" en `number-form-page.tsx`).
- `TASK-DASH-0078` (coherencia con maquetas UX/UI).