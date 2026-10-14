# TASK-API-0170 — Implementar endpoints administrativos de Role

## Objetivo

Implementar los servicios, repositorios y endpoints administrativos necesarios para que el Dashboard pueda consultar y crear roles durante la administración de los Números.

La implementación debe reutilizar la entidad `Role` y su persistencia definida en `TASK-API-0165`.

## Alcance

La Task comprende:

- Implementar o completar el repositorio de `Role` para las operaciones requeridas.
- Implementar el servicio de aplicación de `Role`.
- Implementar endpoint administrativo paginado para consultar roles.
- Implementar endpoint administrativo para crear un rol.
- Aplicar las reglas de autenticación y autorización administrativa.
- Documentar los endpoints implementados.

## Endpoints

### GET /api/admin-roles

Permitir consultar roles disponibles para utilizarlos en los formularios administrativos del catálogo.

Debe permitir búsqueda por nombre.

El endpoint debe ser **siempre paginado**, utilizando el contrato estándar de paginación de los endpoints administrativos del Dashboard.

Debe devolver la información necesaria para mostrar y seleccionar un rol en el Dashboard.

### POST /api/admin-roles

Crear un nuevo rol.

El endpoint debe recibir únicamente los datos propios de `Role`.

La creación debe devolver el identificador del rol creado y los datos necesarios para que el Dashboard pueda incorporarlo inmediatamente a la selección del formulario de Número.

## Servicios

Implementar el servicio de aplicación correspondiente a `Role`.

El servicio debe:

- Validar los datos recibidos.
- Crear la entidad `Role`.
- Persistirla mediante el repositorio correspondiente.
- Consultar roles mediante el repositorio.
- Aplicar la paginación y búsqueda requeridas.
- Devolver los resultados de las operaciones.

Las reglas de negocio propias de `Role` deben permanecer en Application y no depender del controlador.

## Repositorio

Implementar o completar el repositorio de `Role` para soportar:

- Consulta paginada de roles.
- Búsqueda por nombre.
- Persistencia de nuevos roles.

Las consultas de lectura deben utilizar `AsNoTracking` cuando corresponda.

## Seguridad

Los endpoints deben requerir:

- Usuario autenticado.
- Rol `Administrator`.

No deben existir endpoints públicos para crear o modificar roles.

## Integridad

La implementación debe respetar la entidad `Role` y las relaciones existentes.

Esta Task no comprende la administración de la relación `PersonByRole`.

La asociación de roles con personas y números se realizará posteriormente desde la administración del Número.

## Fuera de alcance

No implementar en esta Task:

- `PersonByRole`.
- Administración de `Person`.
- Administración de `Number`.
- Asociación de roles con personas.
- Asociación de roles con números.
- Eliminación de roles.
- Desactivación de roles, salvo que forme parte del modelo ya definido.
- Endpoints públicos de roles.

## Documentación

Actualizar, cuando corresponda:

- `project/domain.md`
- `project/services/services-application.md`
- `project/repositories.md`
- `project/endpoints.md`
- Documentación específica de endpoints administrativos de roles.

## Criterios de aceptación

- [ ] Existe repositorio de `Role` con las operaciones necesarias.
- [ ] Existe servicio de aplicación para `Role`.
- [ ] Existe `GET /api/admin-roles`.
- [ ] El GET permite buscar roles por nombre.
- [ ] El GET implementa paginación obligatoriamente.
- [ ] La paginación respeta el contrato estándar de los endpoints administrativos.
- [ ] Existe `POST /api/admin-roles`.
- [ ] El POST crea correctamente un rol.
- [ ] El POST devuelve el identificador del rol creado.
- [ ] El rol creado puede utilizarse inmediatamente en el formulario de Número.
- [ ] Los endpoints requieren autenticación.
- [ ] Los endpoints requieren rol `Administrator`.
- [ ] No se implementa aquí `PersonByRole`.
- [ ] La solución compila correctamente.
- [ ] La documentación queda alineada con la implementación.

## Resultado

### Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin-roles` | Listado paginado de roles con búsqueda por nombre |
| POST | `/api/admin-roles` | Crear un nuevo rol |

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/Interfaces/IRoleRepository.cs` | Interfaz del repositorio de Role |
| `api/Application/Interfaces/IRoleService.cs` | Interfaz del servicio de Role |
| `api/Application/Services/RoleService.cs` | Implementación del servicio de aplicación |
| `api/Application/DTOs/RoleListItemDto.cs` | DTO para listado de roles |
| `api/Infrastructure/Repositories/RoleRepository.cs` | Implementación del repositorio |
| `api/Api/Controllers/AdminRolesController.cs` | Controller con endpoints administrativos |

### Decisiones relevantes

- Paginación obligatoria en GET
- Búsqueda por nombre con operador Contains
- AsNoTracking en consultas de lectura
- Autenticación y rol Administrator requeridos

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe repositorio de `Role` con las operaciones necesarias
- [x] Existe servicio de aplicación para `Role`
- [x] Existe `GET /api/admin-roles`
- [x] El GET permite buscar roles por nombre
- [x] El GET implementa paginación obligatoriamente
- [x] La paginación respeta el contrato estándar de los endpoints administrativos
- [x] Existe `POST /api/admin-roles`
- [x] El POST crea correctamente un rol
- [x] El POST devuelve el identificador del rol creado
- [x] El rol creado puede utilizamente en el formulario de Número
- [x] Los endpoints requieren autenticación
- [x] Los endpoints requieren rol `Administrator`
- [x] No se implementa aquí `PersonByRole`
- [x] La solución compila correctamente
- [x] La documentación queda alineada con la implementación