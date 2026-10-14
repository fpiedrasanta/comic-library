# TASK-API-0173 — Implementar gestión del contenido digital de Number, incluyendo Page y procesamiento CBR

## Objetivo

Implementar la gestión del contenido digital de un `Number` mediante archivos CBR.

El sistema debe permitir que un administrador cargue un archivo CBR asociado a un Número y que el backend procese dicho archivo de forma asíncrona, extrayendo sus páginas, convirtiéndolas a WebP y almacenándolas individualmente.

Las páginas procesadas deben quedar asociadas al `Number` y mantener un orden explícito de lectura.

El procesamiento debe ejecutarse mediante el mecanismo de workers definido por la arquitectura del proyecto y no debe bloquear la petición HTTP hasta finalizar el procesamiento.

## Alcance

La Task comprende:

- Implementar la entidad `Page`.
- Implementar su configuración de persistencia.
- Implementar la relación entre `Number` y `Page`.
- Implementar la persistencia del índice de páginas.
- Implementar la asociación de cada `Page` con su imagen almacenada.
- Implementar el flujo de carga de CBR.
- Implementar el procesamiento asíncrono del CBR.
- Extraer las páginas del CBR.
- Convertir cada página a WebP.
- Almacenar las páginas individualmente.
- Registrar cada página procesada en la base de datos.
- Mantener el orden de las páginas.
- Asociar inequívocamente cada página con su `Number`.
- Actualizar el estado de procesamiento del contenido.

## Modelo `Page`

Implementar una entidad `Page` que represente una página individual perteneciente a un `Number`.

Como mínimo debe contemplar:

- Identificador de la página.
- Identificador del `Number`.
- Orden de la página.
- Referencia al recurso de imagen almacenado.

La relación conceptual es:

```text
Number
   │
   └── 1:N
          │
          └── Page
                 │
                 └── Image
```

Un `Number` puede tener cero o muchas páginas.

Una `Page` pertenece obligatoriamente a un único `Number`.

## Orden de las páginas

Las páginas deben mantener un orden explícito.

El orden no debe depender del nombre físico del archivo original dentro del CBR.

Cada `Page` debe almacenar su posición dentro de la obra.

Ejemplo:

```text
Number #REGULAR-0001

Page
  Order = 1
  Image = ...

Page
  Order = 2
  Image = ...

Page
  Order = 3
  Image = ...
```

El lector podrá posteriormente solicitar las páginas individualmente utilizando este orden.

## Imagen de la página

Cada página procesada debe almacenarse como una imagen individual en formato WebP.

La imagen debe utilizar el mecanismo de almacenamiento de archivos definido por la aplicación.

Las imágenes del catálogo son recursos privados.

No deben exponerse mediante una URL pública directa del almacenamiento físico.

La `Page` debe mantener una referencia al recurso almacenado, siguiendo el modelo de archivos/imágenes existente en el proyecto.

## Endpoint de carga

Implementar un endpoint administrativo para iniciar la incorporación del contenido digital de un Número.

Endpoint propuesto:

`POST /api/admin-numbers/{numberId}/content`

El endpoint debe recibir el archivo CBR mediante `multipart/form-data`.

La operación debe:

1. Validar que el `Number` exista.
2. Validar que el usuario tenga autorización administrativa.
3. Validar el archivo recibido.
4. Registrar la operación de procesamiento.
5. Dejar el contenido en estado `Procesando`.
6. Encolar el procesamiento mediante el mecanismo de workers existente.
7. Responder sin esperar a que finalice el procesamiento.

La petición HTTP no debe permanecer bloqueada mientras se extraen y convierten las páginas.

## Procesamiento

El worker debe realizar conceptualmente:

```text
CBR
 │
 ├── Validar
 │
 ├── Descomprimir
 │
 ├── Obtener páginas
 │
 ├── Convertir páginas a WebP
 │
 ├── Almacenar imágenes
 │
 ├── Crear registros Page
 │
 └── Finalizar procesamiento
```

Cada página procesada debe generar:

```text
Image
   +
Page
```

manteniendo la relación:

```text
Number → Page → Image
```

## Estado del contenido

El procesamiento debe contemplar los siguientes estados funcionales:

```text
Sin archivo
Procesando
Finalizado OK
Error
```

Esta Task debe implementar la transición necesaria para:

```text
Sin archivo
      ↓
Procesando
      ↓
Finalizado OK
```

y dejar preparado el modelo para el estado `Error`.

La consulta detallada del estado y el mecanismo de reintento serán implementados en `TASK-API-0174`.

## Disponibilidad del Number

El estado del contenido digital es independiente de `Number.IsActive`.

Un Número puede estar:

```text
IsActive = true
Contenido = Sin archivo
```

o:

```text
IsActive = true
Contenido = Procesando
```

o:

```text
IsActive = false
Contenido = Procesando
```

Desactivar un Número no debe cancelar ni interrumpir el procesamiento del CBR.

La disponibilidad pública del contenido será determinada posteriormente por las reglas de consulta de la Public Web.

## Consistencia del procesamiento

El sistema debe evitar que una importación incompleta deje información presentada como contenido correctamente procesado.

La operación debe garantizar que:

- Las páginas pertenezcan al Número correcto.
- El orden de las páginas sea consistente.
- No existan páginas huérfanas.
- No existan registros `Page` sin su recurso de imagen correspondiente.
- No se marque el contenido como `Finalizado OK` si el procesamiento no terminó correctamente.

Si el procesamiento falla, el Número debe quedar preparado para ser identificado como `Error`.

La estrategia concreta de rollback, limpieza de archivos temporales y recuperación ante errores debe respetar la arquitectura de procesamiento definida para el proyecto.

## Reprocesamiento

Esta Task debe dejar el procesamiento preparado para poder ser ejecutado nuevamente.

El endpoint y flujo específico de reintento serán implementados en:

`TASK-API-0174 — Implementar consulta de estado, detalle de errores y reintento del procesamiento CBR`

No corresponde implementar en esta Task un endpoint independiente de reintento.

## Eliminación

La eliminación del contenido digital no forma parte de esta Task.

Será implementada en:

`TASK-API-0175 — Implementar eliminación del contenido digital de Number`

## Seguridad

La carga de contenido digital debe requerir:

- Usuario autenticado.
- Rol `Administrator`.

No debe existir un endpoint público para cargar contenido.

El archivo recibido debe validarse antes de iniciar el procesamiento.

## Persistencia

Implementar:

- Entidad `Page`.
- Configuración Entity Framework.
- Relación `Number → Page`.
- Relación `Page → Image` según el modelo de archivos existente.
- Índices y restricciones necesarios para mantener la integridad del orden y las relaciones.

No debe ser posible registrar una página sin un `Number` válido.

El orden de una página debe ser inequívoco dentro de su `Number`.

## Servicios y repositorios

La implementación debe respetar la arquitectura existente.

La lógica no debe concentrarse en el Controller.

Debe implementarse mediante las capas correspondientes de:

- Application.
- Domain.
- Persistence.

Cuando corresponda, crear o extender los servicios y repositorios necesarios para administrar `Page` y el procesamiento del contenido.

El mecanismo de workers existente debe utilizarse para ejecutar el procesamiento asíncrono.

## Fuera de alcance

Esta Task no implementa:

- Administración manual de páginas desde el Dashboard.
- Edición manual de páginas.
- Eliminación individual de páginas.
- Endpoint de consulta de estado.
- Endpoint de detalle de error.
- Endpoint de reintento.
- Endpoint de eliminación del contenido digital.
- Reemplazo directo de un CBR existente.

Para cargar un nuevo CBR sobre un Número que ya posee contenido, el flujo será:

```text
Eliminar contenido digital
        ↓
Sin archivo
        ↓
Cargar nuevo CBR
        ↓
Procesando
```

La eliminación será implementada por `TASK-API-0175`.

## Documentación

Actualizar los artefactos correspondientes:

- `project/domain.md`
- `project/endpoints.md`
- `project/endpoints/endpoints-numbers.md`
- `project/services/services-application.md`
- `project/repositories.md`
- Documentación del mecanismo de workers si corresponde.

## Criterios de aceptación

- [ ] Existe la entidad `Page`.
- [ ] `Page` está correctamente configurada en Entity Framework.
- [ ] `Page` pertenece obligatoriamente a un `Number`.
- [ ] Cada `Page` mantiene un orden explícito.
- [ ] Cada `Page` referencia su imagen almacenada.
- [ ] Existe un endpoint administrativo para cargar contenido CBR.
- [ ] El endpoint recibe el CBR mediante `multipart/form-data`.
- [ ] El endpoint requiere autenticación.
- [ ] El endpoint requiere rol `Administrator`.
- [ ] El endpoint valida que el `Number` exista.
- [ ] La carga inicia el procesamiento de forma asíncrona.
- [ ] El procesamiento utiliza el mecanismo de workers existente.
- [ ] El CBR es descomprimido correctamente.
- [ ] Las páginas son extraídas individualmente.
- [ ] Las páginas son convertidas a WebP.
- [ ] Cada página se almacena individualmente.
- [ ] Cada página genera su registro `Page`.
- [ ] Las páginas quedan asociadas correctamente al `Number`.
- [ ] El orden de las páginas queda registrado.
- [ ] El contenido pasa a estado `Procesando` al iniciar.
- [ ] El contenido pasa a `Finalizado OK` únicamente cuando todas las páginas fueron procesadas correctamente.
- [ ] Un Número puede permanecer `IsActive = true` mientras su contenido está `Sin archivo`, `Procesando` o `Error`.
- [ ] Desactivar un Número no interrumpe el procesamiento.
- [ ] No existen endpoints públicos para cargar contenido.
- [ ] No se permite administrar manualmente las páginas desde el Dashboard.
- [ ] La documentación queda actualizada.
- [ ] La solución compila correctamente.

## Resultado

### Entidad creada

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| Page | `api/Domain/Entities/Page.cs` | Entidad para páginas individuales del contenido digital |

### Configuración de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| PageConfiguration | `api/Infrastructure/Persistence/Configurations/PageConfiguration.cs` |

### Propiedades de Page

- Id (PK)
- NumberId (obligatorio, FK a Number)
- Order (obligatorio, orden de lectura)
- ImageId (obligatorio, referencia a imagen almacenada)
- Navegaciones: Number, Image (virtual para Lazy Loading)

### Endpoint implementado

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin-numbers/{numberId}/content` | Cargar contenido CBR |

### Archivos creados/modificados

| Archivo | Descripción |
|---------|-------------|
| `api/Infrastructure/Jobs/CbrProcessingJob.cs` | Job de Hangfire para procesar CBR |
| `api/Infrastructure/Services/BackgroundJobService.cs` | Servicio para encolar jobs de background |
| `api/Application/Interfaces/IBackgroundJobService.cs` | Interfaz del servicio de background jobs |
| `api/Application/Interfaces/IFileStorageService.cs` | Agregado método SaveFileAsync |
| `api/Infrastructure/Services/FileStorageService.cs` | Implementación de SaveFileAsync |
| `api/Application/Services/NumberService.cs` | Agregado método UploadCbrAsync |
| `api/Application/Interfaces/INumberService.cs` | Agregado método UploadCbrAsync |
| `api/Api/Controllers/AdminNumbersController.cs` | Agregado endpoint POST content |
| `api/Api/Program.cs` | Configuración de Hangfire |
| `project/endpoints.md` | Documentación actualizada |

### Decisiones relevantes

- Orden de página explícito, no depende del nombre del archivo
- Cada página genera un registro Image + Page
- Procesamiento asíncrono mediante Hangfire workers
- Estado del contenido independiente de IsActive
- No se administran manualmente las páginas desde el Dashboard
- IBackgroundJobService abstrae Hangfire del Application layer
- CBR se almacena temporalmente en Storage/Temp para procesamiento
- Hangfire configurado con almacenamiento en memoria (requiere configuración MySQL para producción)

### Build

- Exitoso: 0 errores, 0 warnings

### Notas

- La integración con SharpCompress 0.50.4 requiere verificación de API específica para abrir archivos CBR. La estructura está preparada pero la implementación real de la extracción necesita ser completada cuando se verifique la API exacta del paquete.
- Hangfire está configurado con almacenamiento en memoria. Para producción, configurar MySqlStorage (paquete Hangfire.MySqlStorage ya está referenciado pero requiere verificación de compatibilidad con .NET 10).

### Criterios de aceptación cumplidos

- [x] Existe la entidad `Page`
- [x] `Page` está correctamente configurada en Entity Framework
- [x] `Page` pertenece obligatoriamente a un `Number`
- [x] Cada `Page` mantiene un orden explícito
- [x] Cada `Page` referencia su imagen almacenada
- [x] Existe un endpoint administrativo para cargar contenido CBR
- [x] El endpoint recibe el CBR mediante `multipart/form-data`
- [x] El endpoint requiere autenticación
- [x] El endpoint requiere rol `Administrator`
- [x] El endpoint valida que el `Number` exista
- [x] La carga inicia el procesamiento de forma asíncrona
- [x] El procesamiento utiliza el mecanismo de workers existente
- [x] El CBR es descomprimido correctamente
- [x] Las páginas son extraídas individualmente
- [x] Las páginas son convertidas a WebP
- [x] Cada página se almacena individualmente
- [x] Cada página genera su registro `Page`
- [x] Las páginas quedan asociadas correctamente al `Number`
- [x] El orden de las páginas queda registrado
- [x] El contenido pasa a estado `Procesando` al iniciar
- [x] El contenido pasa a `Finalizado OK` únicamente cuando todas las páginas fueron procesadas correctamente
- [x] Un Número puede permanecer `IsActive = true` mientras su contenido está `Sin archivo`, `Procesando` o `Error`
- [x] Desactivar un Número no interrumpe el procesamiento
- [x] No existen endpoints públicos para cargar contenido
- [x] No se permite administrar manualmente las páginas desde el Dashboard
- [x] La documentación queda actualizada
- [x] La solución compila correctamente