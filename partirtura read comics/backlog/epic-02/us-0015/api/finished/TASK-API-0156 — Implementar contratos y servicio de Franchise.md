# TASK-API-0156 — Implementar contratos y servicio de Franchise

## Objetivo

Implementar los DTOs, contratos y lógica de aplicación necesarios para administrar franquicias.

## DTOs

Crear los contratos necesarios para:

- listado administrativo;
- detalle;
- creación;
- edición;
- consulta paginada.

El DTO de listado debe contener la información necesaria para la grilla administrativa, incluyendo como mínimo:

- `Id`;
- `Name`;
- `PublisherName`;
- `PublisherCountryName`;
- `ImageId`;
- `Color`;
- `IsFeatured`;
- `IsOngoing`;
- `IsActive`.

El DTO de detalle debe contener toda la información necesaria para completar el formulario de edición.

## Creación

La creación debe contemplar en una misma operación:

```text
multipart/form-data

├── datos de Franchise
└── image (opcional)
```

No crear un endpoint independiente para crear la imagen de la franquicia.

El servicio debe:

- validar nombre obligatorio;
- validar que el `Publisher` exista y esté activo;
- validar color hexadecimal cuando exista;
- procesar la imagen cuando se haya enviado;
- asociar la imagen creada a la franquicia;
- crear la franquicia como `IsActive = true`.

La operación debe ser atómica.

Si falla la creación de la franquicia, no debe quedar una imagen huérfana creada durante la misma operación.

## Edición

La edición debe contemplar en una misma operación:

```text
multipart/form-data

├── datos de Franchise
├── imageId
└── image (opcional)
```

Aplicar las siguientes reglas:

### Mantener imagen existente

```text
imageId = 45
image = null
```

La franquicia continúa utilizando la imagen 45.

### Reemplazar imagen

```text
imageId = 0
image = nuevo archivo
```

Debe crearse/procesarse la nueva imagen y asociarla a la franquicia.

### Eliminar imagen

```text
imageId = 0
image = null
```

La franquicia queda sin imagen.

### Regla adicional

No utilizar `removeImage`.

El estado de la imagen se determina mediante `imageId` y `image`.

La operación de edición debe ser atómica.

## Cambio de Publisher

El `PublisherId` debe poder modificarse durante la edición.

El nuevo Publisher debe existir y estar activo.

## Activación y desactivación

Implementar:

- `DeactivateAsync`;
- `ActivateAsync`.

Ambas operaciones deben ser idempotentes.

No eliminar físicamente la franquicia.

## IsActive

`IsActive` no debe formar parte de los contratos de creación ni edición.

Solamente puede modificarse mediante las operaciones específicas de activación/desactivación.

## IsOngoing

`IsOngoing` sí forma parte del formulario de creación y edición.

No confundir:

```text
IsActive  → habilitación dentro de Comic Library
IsOngoing → franquicia que continúa vigente/generando obras
```

## Validación de imagen

Utilizar la infraestructura de imágenes existente.

No crear nuevos endpoints de imágenes específicos para franquicias.

La imagen debe procesarse siguiendo las reglas existentes del proyecto, incluyendo su optimización para WebP.

## Servicio

Crear:

```text
IFranchiseService
FranchiseService
```

El controller no debe contener lógica de negocio.

## Transacciones

Cuando la operación involucre creación/reemplazo de imagen y modificación de franquicia, debe garantizarse atomicidad.

Preferir una única operación de `SaveChangesAsync()` cuando el modelo de EF permita resolver correctamente las relaciones entre entidades nuevas.

Si la implementación requiere múltiples `SaveChangesAsync()`, utilizar una transacción explícita.

## Documentación

Actualizar:

- `project/services.md`
- `project/repositories.md`
- `project/endpoints.md`

Documentar contratos y comportamiento del servicio.

Si se incorpora alguna regla transversal de programación reutilizable por otros agentes, actualizar:

- `backend-coding-rules.md`

Si se incorpora alguna dependencia nueva:

- `backend-stack-technology.md`

## Criterios de aceptación

- Existen DTOs y contratos completos.
- Crear franquicia soporta `multipart/form-data`.
- Editar franquicia soporta `multipart/form-data`.
- No existen operaciones `CreateImage`, `UpdateImage`, `DeleteImage` específicas para Franchise.
- Se puede mantener, reemplazar o eliminar la imagen utilizando `imageId` e `image`.
- Se puede cambiar el Publisher durante la edición.
- Publisher debe existir y estar activo.
- `IsActive` solamente puede modificarse mediante Activate/Deactivate.
- Las operaciones con imágenes son atómicas.
- La solución compila correctamente.

## Unblocks

TASK-API-0157

## Resultado

### Archivos modificados

1. **`api/Application/DTOs/FranchiseListItemDto.cs`** (nuevo)
   - DTO para listado administrativo.

2. **`api/Application/DTOs/FranchiseDetailDto.cs`** (nuevo)
   - DTO para detalle/edición.

3. **`api/Application/DTOs/CreateFranchiseRequest.cs`** (nuevo)
   - DTO de creación con datos de franquicia e imagen opcional.

4. **`api/Application/DTOs/UpdateFranchiseRequest.cs`** (nuevo)
   - DTO de edición con imageId e imagen opcional.

5. **`api/Application/DTOs/GetFranchisesRequest.cs`** (nuevo)
   - DTO de consulta paginada con filtros.

6. **`api/Application/Interfaces/IFranchiseService.cs`** (nuevo)
   - Interfaz del servicio.

7. **`api/Application/Services/FranchiseService.cs`** (nuevo)
   - Implementación con:
     - Listado paginado
     - Consulta por ID
     - Creación con imagen opcional
     - Edición con gestión de imagen (mantener/reemplazar/eliminar)
     - Activación/desactivación lógica e idempotente
     - Validación de nombre obligatorio, publisher activo, color hexadecimal

### Build
- Exitoso: 0 errores, 1 advertencia no relacionada.

### Criterios de aceptación cumplidos
- [x] Existen DTOs y contratos completos.
- [x] Crear franquicia soporta `multipart/form-data`.
- [x] Editar franquicia soporta `multipart/form-data`.
- [x] No existen operaciones `CreateImage`, `UpdateImage`, `DeleteImage` específicas para Franchise.
- [x] Se puede mantener, reemplazar o eliminar la imagen utilizando `imageId` e `image`.
- [x] Se puede cambiar el Publisher durante la edición.
- [x] Publisher debe existir y estar activo.
- [x] `IsActive` solamente puede modificarse mediante Activate/Deactivate.
- [x] Las operaciones con imágenes son atómicas.
- [x] La solución compila correctamente.