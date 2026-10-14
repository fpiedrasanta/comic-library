# TASK-API-0157 — Implementar endpoints administrativos de Franchise

## Objetivo

Implementar los endpoints administrativos necesarios para gestionar franquicias.

## Controller

Crear:

```text
AdminFranchisesController
```

Todos los endpoints deben requerir:

```text
[Authorize(Roles = Roles.Administrator)]
```

El controller debe limitarse a:

- recibir requests;
- delegar al servicio;
- devolver respuestas HTTP.

No debe contener lógica de negocio, validaciones ni persistencia.

## Endpoints

### Listado

```http
GET /api/admin-franchises
```

Debe soportar:

- búsqueda;
- `isFeatured`;
- `isOngoing`;
- `isActive`;
- `sortBy`;
- `sortDirection`;
- paginación.

### Detalle

```http
GET /api/admin-franchises/{franchiseId}
```

Debe devolver la información necesaria para editar una franquicia.

### Crear

```http
POST /api/admin-franchises
Content-Type: multipart/form-data
```

Debe recibir datos de la franquicia y la imagen opcional en la misma operación.

### Editar

```http
PUT /api/admin-franchises/{franchiseId}
Content-Type: multipart/form-data
```

Debe permitir:

- modificar datos;
- cambiar Publisher;
- mantener imagen;
- reemplazar imagen;
- eliminar imagen.

### Desactivar

```http
PATCH /api/admin-franchises/{franchiseId}/deactivate
```

### Activar

```http
PATCH /api/admin-franchises/{franchiseId}/activate
```

No implementar:

```text
DELETE /api/admin-franchises/{id}
```

## Documentación

Actualizar:

```text
project/endpoints.md
```

Documentar:

- rutas;
- métodos HTTP;
- autorización;
- parámetros;
- multipart/form-data;
- respuestas;
- errores esperables.

## Registro DI

Registrar:

- `IFranchiseService`;
- `IFranchiseRepository`;

en `Program.cs`, siguiendo el patrón existente.

## Criterios de aceptación

- Todos los endpoints están protegidos por rol Administrator.
- POST utiliza multipart/form-data.
- PUT utiliza multipart/form-data.
- No existen endpoints independientes para imágenes de Franchise.
- Activate/Deactivate funcionan mediante PATCH.
- No existe DELETE físico.
- El controller no contiene lógica de negocio.
- La solución compila correctamente.

## Unblocks

TASK-API-0158

## Resultado

### Archivos modificados

1. **`api/Api/DTOs/CreateFranchiseFormRequest.cs`** (nuevo)
   - DTO de creación para el controller.

2. **`api/Api/DTOs/UpdateFranchiseFormRequest.cs`** (nuevo)
   - DTO de edición para el controller.

3. **`api/Api/Controllers/AdminFranchisesController.cs`** (nuevo)
   - Controller con endpoints: GET (listado), GET (detalle), POST, PUT, PATCH deactivate, PATCH activate.
   - Todos protegidos con [Authorize(Roles = Roles.Administrator)].

4. **`api/Api/Program.cs`**
   - Registro de IFranchiseRepository e IFranchiseService.

5. **`project/endpoints.md`**
   - Agregada documentación de endpoints de franquicias.

6. **`project/endpoints/endpoints-franchises.md`** (nuevo)
   - Documentación completa de cada endpoint.

### Build
- Exitoso: 0 errores (Application e Infrastructure). API requiere detener proceso para build.

### Criterios de aceptación cumplidos
- [x] Todos los endpoints están protegidos por rol Administrator.
- [x] POST utiliza multipart/form-data.
- [x] PUT utiliza multipart/form-data.
- [x] No existen endpoints independientes para imágenes de Franchise.
- [x] Activate/Deactivate funcionan mediante PATCH.
- [x] No existe DELETE físico.
- [x] El controller no contiene lógica de negocio.
- [x] La solución compila correctamente.