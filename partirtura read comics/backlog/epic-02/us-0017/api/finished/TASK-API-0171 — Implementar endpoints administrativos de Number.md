# TASK-API-0171 — Implementar endpoints administrativos de Number

## Objetivo

Implementar los servicios, repositorios y endpoints administrativos necesarios para consultar, crear, modificar, activar y desactivar los Números pertenecientes a una Serie.

La implementación debe utilizar las entidades y relaciones definidas en:

- `TASK-API-0163` — Number.
- `TASK-API-0164` — Person.
- `TASK-API-0165` — Role.
- `TASK-API-0166` — Tag.
- `TASK-API-0167` — PersonByRole.
- `TASK-API-0168` — TagByNumber.

## Alcance

La Task comprende:

- Implementar o completar el repositorio de `Number`.
- Implementar el servicio de aplicación de `Number`.
- Implementar endpoint administrativo paginado para listar Números.
- Implementar endpoint administrativo para crear un Número.
- Implementar endpoint administrativo para modificar un Número.
- Implementar endpoints administrativos para activar y desactivar un Número.
- Implementar búsqueda, filtrado, ordenamiento y paginación del listado.
- Implementar la sincronización de `PersonByRole`.
- Implementar la sincronización de `TagByNumber`.
- Implementar la administración de las relaciones de continuidad anterior/siguiente.
- Implementar la asociación de idioma.
- Implementar la administración de la portada según el contrato de imágenes existente.
- Aplicar las reglas de integridad, autenticación y autorización administrativa.
- Documentar los endpoints implementados.

## Endpoints

### GET /api/admin-numbers

Obtener el listado administrativo de Números.

El endpoint debe ser **siempre paginado**.

Debe permitir:

### Búsqueda

Buscar por:

- Número.
- Título.

### Filtros

Debe permitir filtrar por:

- Estado activo.
- Idioma.
- Estado del contenido digital.

El filtro de contenido debe contemplar como mínimo:

```text
Todos
Faltante
Procesando
OK
Error
```

También debe permitir filtrar por fecha de publicación:

- Fecha desde.
- Fecha hasta.

### Ordenamiento

Debe permitir ordenar por:

- Número.
- Título.
- Fecha de publicación.
- Fecha de subida.
- Idioma.

El ordenamiento por Número debe respetar el orden natural definido para los valores del catálogo.

Los valores de `Number` son cadenas libres.

Por ejemplo:

```text
#ANUAL-0001
#ANUAL-0002
...
#REGULAR-0001
#REGULAR-0002
...
```

El backend debe ordenar los valores de acuerdo con las reglas definidas para el catálogo y no tratarlos simplemente como un identificador numérico.

### Resultado

El listado debe devolver la información necesaria para mostrar:

```text
Imagen thumb
Activo
Número
Título
Fecha de subida
Fecha de publicación
Anterior
Siguiente
Estado del contenido
Acciones
```

La información de Serie, Franquicia y Editorial puede utilizarse como contexto informativo del listado, pero no se modifica desde esta operación.

---

## POST /api/admin-numbers

Crear un nuevo Número asociado a una Serie.

El contrato debe recibir:

- `SeriesId`.
- `Number`.
- `Title`.
- `Description`.
- `LanguageId`.
- `Cover`.
- `PublicationDate`.
- `PreviousNumberId`.
- `NextNumberId`.
- Personas y roles.
- Tags.

`IsActive` debe establecerse según la regla definida para el alta y **no debe quedar expuesto como un dato libremente manipulable dentro del contrato de creación**, salvo que el contrato general del proyecto determine explícitamente lo contrario.

El Número debe heredar su Editorial a través de:

```text
Editorial
   ↓
Franchise
   ↓
Series
   ↓
Number
```

No debe existir `PublisherId` propio en `Number`.

Tampoco debe existir `FranchiseId` propio en `Number`.

---

## PUT /api/admin-numbers/{numberId}

Modificar un Número existente.

Debe permitir modificar los datos propios del Número y sus relaciones administrables.

Debe contemplar:

- Número.
- Título.
- Descripción.
- Idioma.
- Portada.
- Fecha de publicación.
- Número anterior.
- Número siguiente.
- Personas y roles.
- Tags.

No debe permitir modificar:

- `NumberId`.
- `SeriesId`.
- `FranchiseId`.
- `PublisherId`.

La Serie, Franquicia y Editorial constituyen el contexto estructural del Número y no pueden cambiarse desde la edición.

Si un Número debe pertenecer a otra Serie, debe eliminarse y crearse nuevamente en la Serie correspondiente.

---

## Sincronización de PersonByRole

El POST y PUT deben permitir recibir la colección de personas y roles asociadas al Número.

Una misma persona puede desempeñar múltiples roles dentro del mismo Número.

Un mismo rol puede ser desempeñado por múltiples personas.

Ejemplo:

```json
[
  {
    "personId": 1,
    "roleId": 2
  },
  {
    "personId": 1,
    "roleId": 3
  },
  {
    "personId": 2,
    "roleId": 2
  }
]
```

La colección representa el estado final de las relaciones del Número.

El servicio debe sincronizar `PersonByRole` para que la persistencia coincida con la colección recibida.

Las personas y roles deben existir previamente.

La creación de personas y roles se realiza mediante los endpoints definidos en:

- `TASK-API-0169`.
- `TASK-API-0170`.

---

## Sincronización de Tags

El POST y PUT deben permitir recibir la colección de Tags asociadas al Número.

Ejemplo:

```json
[
  {
    "name": "Terror",
    "id": 1
  },
  {
    "name": "Amor",
    "id": 0
  }
]
```

La colección representa el estado final de los Tags asociados al Número.

### Tag existente

Si el Tag posee un identificador existente:

```text
id > 0
```

debe utilizarse el Tag existente.

### Tag nuevo

Si el Tag posee:

```text
id = 0
```

el servicio debe verificar si ya existe un Tag con ese nombre.

Si existe:

```text
obtener Tag existente
```

Si no existe:

```text
crear Tag
```

Posteriormente debe crear o mantener la relación `TagByNumber`.

El sistema debe evitar duplicar Tags y relaciones `TagByNumber`.

No se requieren endpoints independientes de Tag para esta funcionalidad.

La sincronización de Tags forma parte del POST y PUT de Number.

---

## Continuidad

El POST y PUT deben permitir establecer:

- Número anterior.
- Número siguiente.

Ambos son opcionales.

El administrador puede establecer:

- solamente anterior;
- solamente siguiente;
- ambos;
- ninguno.

Las relaciones deben mantenerse bidireccionalmente.

Por ejemplo:

```text
#20
   ↓ siguiente
#21
```

debe resultar en:

```text
#20.siguiente = #21
#21.anterior = #20
```

Si posteriormente se modifica la relación, el servicio debe limpiar la relación inversa anterior cuando corresponda para evitar referencias obsoletas.

La continuidad no debe inferirse automáticamente a partir del campo `Number`.

Debe mantenerse mediante referencias explícitas.

---

## PATCH /api/admin-numbers/{numberId}/activate

Activar un Número.

La operación debe modificar únicamente el estado administrativo correspondiente.

No debe modificar:

- contenido digital;
- páginas;
- continuidad;
- personas;
- roles;
- Tags;
- idioma;
- fechas.

---

## PATCH /api/admin-numbers/{numberId}/deactivate

Desactivar un Número.

La operación debe modificar únicamente el estado administrativo correspondiente.

Desactivar un Número no debe:

- eliminar su contenido digital;
- eliminar sus páginas;
- interrumpir un procesamiento CBR en curso;
- modificar sus relaciones.

`IsActive` y el estado del contenido digital son conceptos independientes.

---

## Integridad

El servicio debe validar, como mínimo:

- La Serie existe.
- La Serie está disponible para la operación de creación/modificación según las reglas de dominio.
- El Idioma existe.
- Los Números anterior y siguiente existen cuando se informan.
- Los Números anterior y siguiente pertenecen a la misma Serie.
- Las Personas existen.
- Los Roles existen.
- Los Tags existentes corresponden a registros válidos.
- No existen relaciones `PersonByRole` duplicadas.
- No existen relaciones `TagByNumber` duplicadas.
- `Number` es único dentro de la Serie.
- El Título es obligatorio.
- La Fecha de publicación es obligatoria.
- El formato de la portada respeta el contrato de imágenes.
- Los identificadores estructurales obtenidos del contexto o de la ruta no pueden ser modificados mediante los DTOs.

---

## Portada

El POST y PUT deben utilizar el mismo mecanismo de imágenes utilizado por las entidades del catálogo.

Debe soportarse:

### Crear sin portada

```text
imageId = 0
sin archivo
```

### Crear con portada

```text
imageId = 0
avatar/cover = archivo
```

### Editar conservando portada

```text
imageId = existingId
sin archivo
```

### Editar reemplazando portada

```text
imageId = 0
cover = archivo
```

### Editar eliminando portada

```text
imageId = 0
sin archivo
```

La portada debe mantenerse como recurso privado.

---

## Fecha de publicación

La fecha de publicación es obligatoria.

Debe representar únicamente una fecha de calendario.

No debe almacenarse como fecha y hora.

El formato utilizado por el contrato debe respetar el estándar definido por el proyecto.

---

## Fecha de subida

La fecha de subida/importación debe ser generada automáticamente por el sistema.

No debe ser modificable mediante POST o PUT.

Debe registrarse como `CreatedAt` utilizando fecha y hora.

---

## Estado del contenido digital

El estado del contenido digital debe ser independiente de `IsActive`.

Un Número puede estar:

```text
IsActive = true
ContentStatus = Missing
```

y continuar visible administrativamente.

También puede estar:

```text
IsActive = false
ContentStatus = Processing
```

El procesamiento no debe interrumpirse por desactivar el Número.

La implementación específica del procesamiento y sus estados será completada por:

- `TASK-API-0173`.
- `TASK-API-0174`.
- `TASK-API-0175`.

---

## Seguridad

Todos los endpoints administrativos deben requerir:

- Usuario autenticado.
- Rol `Administrator`.

No deben existir endpoints públicos para modificar Números.

Los contratos de entrada no deben permitir modificar identificadores estructurales que pertenecen al contexto del Número.

---

## Repositorio

El repositorio de `Number` debe soportar las operaciones necesarias para:

- Listado paginado.
- Búsqueda.
- Filtrado.
- Ordenamiento.
- Obtención por identificador para operaciones administrativas.
- Alta.
- Modificación.
- Activación.
- Desactivación.

Las consultas de lectura deben utilizar `AsNoTracking` cuando corresponda.

Las consultas deben evitar problemas de N+1.

---

## Servicio

El servicio de aplicación debe concentrar las reglas de negocio y coordinación de:

- Number.
- Series.
- Language.
- PersonByRole.
- Tags.
- TagByNumber.
- Continuidad.
- Portada.

Las operaciones que modifiquen múltiples entidades deben ejecutarse de forma transaccional.

El controlador no debe contener reglas de negocio.

---

## Fuera de alcance

No implementar en esta Task:

- Administración independiente de Personas.
- Administración independiente de Roles.
- Administración independiente de Tags.
- Administración manual de Pages.
- Procesamiento detallado del CBR.
- Reintento del procesamiento.
- Eliminación del contenido digital.
- Asistencia de IA para descripción.
- Asistencia de IA para Tags.
- Administración de Listas.
- Administración de Continuidad mediante endpoints independientes.

La continuidad se administra dentro del POST/PUT de Number.

---

## Documentación

Actualizar, cuando corresponda:

- `project/domain.md`
- `project/services/services-application.md`
- `project/repositories.md`
- `project/endpoints.md`
- `project/endpoints/endpoints-numbers.md`

La documentación debe reflejar los contratos reales implementados.

## Criterios de aceptación

- [ ] Existe repositorio de `Number`.
- [ ] Existe servicio de aplicación de `Number`.
- [ ] Existe GET paginado de Números.
- [ ] El GET permite búsqueda por Número y Título.
- [ ] El GET permite filtrar por Activo.
- [ ] El GET permite filtrar por Idioma.
- [ ] El GET permite filtrar por estado del contenido digital.
- [ ] El GET permite filtrar por fecha de publicación desde/hasta.
- [ ] El GET permite ordenar por Número, Título, Fecha de publicación, Fecha de subida e Idioma.
- [ ] El GET respeta el orden natural definido para los valores de Number.
- [ ] Existe POST de Number.
- [ ] Existe PUT de Number.
- [ ] Existe PATCH para activar Number.
- [ ] Existe PATCH para desactivar Number.
- [ ] POST y PUT administran `PersonByRole`.
- [ ] Una persona puede tener múltiples roles en un mismo Número.
- [ ] Un rol puede estar asociado a múltiples personas.
- [ ] POST y PUT sincronizan `TagByNumber`.
- [ ] Los Tags nuevos se crean únicamente cuando no existe otro Tag con el mismo nombre.
- [ ] No se crean Tags duplicados.
- [ ] No se crean relaciones `TagByNumber` duplicadas.
- [ ] POST y PUT administran anterior y siguiente.
- [ ] Las relaciones de continuidad se mantienen bidireccionalmente.
- [ ] Se limpian las relaciones inversas obsoletas cuando corresponde.
- [ ] El Number mantiene obligatoriamente su Serie.
- [ ] No existe `PublisherId` en Number.
- [ ] No existe `FranchiseId` en Number.
- [ ] `Number` es único dentro de la Serie.
- [ ] La Fecha de publicación es obligatoria.
- [ ] `CreatedAt` es generado por el sistema.
- [ ] POST y PUT soportan el contrato de portada definido.
- [ ] `IsActive` es independiente del estado del contenido digital.
- [ ] Desactivar un Number no interrumpe el procesamiento CBR.
- [ ] Todos los endpoints requieren autenticación.
- [ ] Todos los endpoints requieren rol `Administrator`.
- [ ] La implementación es transaccional cuando modifica múltiples relaciones.
- [ ] No existe DELETE físico de Number.
- [ ] La solución compila correctamente.
- [ ] La documentación queda alineada con la implementación.

## Resultado

### Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin-numbers` | Listado paginado con búsqueda, filtros y ordenamiento |
| POST | `/api/admin-numbers` | Crear un nuevo Número |
| PUT | `/api/admin-numbers/{numberId}` | Modificar un Número existente |
| PATCH | `/api/admin-numbers/{numberId}/activate` | Activar un Número |
| PATCH | `/api/admin-numbers/{numberId}/deactivate` | Desactivar un Número |

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/Interfaces/INumberRepository.cs` | Interfaz del repositorio de Number |
| `api/Application/Interfaces/INumberService.cs` | Interfaz del servicio de Number |
| `api/Application/Services/NumberService.cs` | Implementación del servicio de aplicación |
| `api/Application/DTOs/NumberListItemDto.cs` | DTO para listado de números |
| `api/Application/DTOs/CreateNumberRequest.cs` | DTO para crear/actualizar números |
| `api/Infrastructure/Repositories/NumberRepository.cs` | Implementación del repositorio |
| `api/Api/Controllers/AdminNumbersController.cs` | Controller con endpoints administrativos |
| `api/Api/DTOs/NumberFormRequests.cs` | Form requests para create/update |

### Decisiones relevantes

- Búsqueda por Number y Title con operador Contains
- Filtros: IsActive, LanguageId, ContentStatus, PublicationDate desde/hasta
- Ordenamiento por Number, Title, PublicationDate, CreatedAt, Language
- Sincronización de PersonByRole: recibe colección final, sincroniza diferencias
- Sincronización de Tags: id > 0 usa existente, id = 0 busca por nombre o crea
- Continidad bidireccional: mantiene PreviousNumber/Number sincronizados
- Operaciones transaccionales cuando modifican múltiples entidades
- Contrato de portada: imageId + archivo (multipart/form-data)

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe repositorio de `Number`
- [x] Existe servicio de aplicación de `Number`
- [x] Existe GET paginado de Números
- [x] El GET permite búsqueda por Número y Título
- [x] El GET permite filtrar por Activo
- [x] El GET permite filtrar por Idioma
- [x] El GET permite filtrar por estado del contenido digital
- [x] El GET permite filtrar por fecha de publicación desde/hasta
- [x] El GET permite ordenar por Número, Título, Fecha de publicación, Fecha de subida e Idioma
- [x] El GET respeta el orden natural definido para los valores de Number
- [x] Existe POST de Number
- [x] Existe PUT de Number
- [x] Existe PATCH para activar Number
- [x] Existe PATCH para desactivar Number
- [x] POST y PUT administran `PersonByRole`
- [x] Una persona puede tener múltiples roles en un mismo Número
- [x] Un rol puede estar asociado a múltiples personas
- [x] POST y PUT sincronizan `TagByNumber`
- [x] Los Tags nuevos se crean únicamente cuando no existe otro Tag con el mismo nombre
- [x] No se crean Tags duplicados
- [x] No se crean relaciones `TagByNumber` duplicadas
- [x] POST y PUT administran anterior y siguiente
- [x] Las relaciones de continuidad se mantienen bidireccionalmente
- [x] Se limpian las relaciones inversas obsoletas cuando corresponde
- [x] El Number mantiene obligatoriamente su Serie
- [x] No existe `PublisherId` en Number
- [x] No existe `FranchiseId` en Number
- [x] `Number` es único dentro de la Serie
- [x] La Fecha de publicación es obligatoria
- [x] `CreatedAt` es generado por el sistema
- [x] POST y PUT soportan el contrato de portada definido
- [x] `IsActive` es independiente del estado del contenido digital
- [x] Desactivar un Number no interrumpe el procesamiento CBR
- [x] Todos los endpoints requieren autenticación
- [x] Todos los endpoints requieren rol `Administrator`
- [x] La implementación es transaccional cuando modifica múltiples relaciones
- [x] No existe DELETE físico de Number
- [x] La solución compila correctamente
- [x] La documentación queda alineada con la implementación