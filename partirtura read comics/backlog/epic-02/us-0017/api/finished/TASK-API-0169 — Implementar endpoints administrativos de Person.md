# TASK-API-0169 — Implementar endpoints administrativos de Person

## Objetivo

Implementar los servicios, repositorios y endpoints administrativos necesarios para que el Dashboard pueda consultar y crear personas durante la administración de los Números.

La implementación debe reutilizar la entidad `Person` y su persistencia definida en `TASK-API-0164`.

## Alcance

La Task comprende:

- Implementar o completar el repositorio de `Person` para las operaciones requeridas.
- Implementar el servicio de aplicación de `Person`.
- Implementar endpoint administrativo paginado para consultar personas.
- Implementar endpoint administrativo para crear una persona.
- Aplicar las reglas de autenticación y autorización administrativa.
- Documentar los endpoints implementados.

## Endpoints

### GET /api/admin-persons

Permitir consultar personas para utilizarlas en los formularios administrativos del catálogo.

Debe permitir búsqueda por nombre.

El endpoint debe ser **siempre paginado**, utilizando el contrato estándar de paginación de los endpoints administrativos del Dashboard.

Debe devolver la información necesaria para mostrar y seleccionar una persona en el Dashboard.

### POST /api/admin-persons

Crear una nueva persona.

El endpoint debe recibir únicamente los datos propios de `Person`.

La creación debe devolver el identificador de la persona creada y los datos necesarios para que el Dashboard pueda incorporarla inmediatamente a la selección del formulario de Número.

## Servicios

Implementar el servicio de aplicación correspondiente a `Person`.

El servicio debe:

- Validar los datos recibidos.
- Crear la entidad `Person`.
- Persistirla mediante el repositorio correspondiente.
- Consultar personas mediante el repositorio.
- Aplicar la paginación y búsqueda requeridas.
- Devolver los resultados de las operaciones.

Las reglas de negocio propias de `Person` deben permanecer en Application y no depender del controlador.

## Repositorio

Implementar o completar el repositorio de `Person` para soportar:

- Consulta paginada de personas.
- Búsqueda por nombre.
- Persistencia de nuevas personas.

Las consultas de lectura deben utilizar `AsNoTracking` cuando corresponda.

## Seguridad

Los endpoints deben requerir:

- Usuario autenticado.
- Rol `Administrator`.

No deben existir endpoints públicos para crear o modificar personas.

## Integridad

La implementación debe respetar la entidad `Person` y las relaciones existentes.

Esta Task no comprende la administración de la relación `PersonByRole`.

La asociación de una persona con un rol se realizará posteriormente desde la administración del Número.

## Fuera de alcance

No implementar en esta Task:

- `PersonByRole`.
- Administración de `Role`.
- Administración de `Number`.
- Asociación de personas con números.
- Eliminación de personas.
- Desactivación de personas, salvo que forme parte del modelo ya definido.
- Endpoints públicos de personas.

## Documentación

Actualizar, cuando corresponda:

- `project/domain.md`
- `project/services/services-application.md`
- `project/repositories.md`
- `project/endpoints.md`
- Documentación específica de endpoints administrativos de personas.

## Criterios de aceptación

- [ ] Existe repositorio de `Person` con las operaciones necesarias.
- [ ] Existe servicio de aplicación para `Person`.
- [ ] Existe `GET /api/admin-persons`.
- [ ] El GET permite buscar personas por nombre.
- [ ] El GET implementa paginación obligatoriamente.
- [ ] La paginación respeta el contrato estándar de los endpoints administrativos.
- [ ] Existe `POST /api/admin-persons`.
- [ ] El POST crea correctamente una persona.
- [ ] El POST devuelve el identificador de la persona creada.
- [ ] La persona creada puede utilizarse inmediatamente en el formulario de Número.
- [ ] Los endpoints requieren autenticación.
- [ ] Los endpoints requieren rol `Administrator`.
- [ ] No se implementa aquí `PersonByRole`.
- [ ] La solución compila correctamente.
- [ ] La documentación queda alineada con la implementación.

## Resultado

### Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin-persons` | Listado paginado de personas con búsqueda por nombre |
| POST | `/api/admin-persons` | Crear una nueva persona |

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/Interfaces/IPersonRepository.cs` | Interfaz del repositorio de Person |
| `api/Application/Interfaces/IPersonService.cs` | Interfaz del servicio de Person |
| `api/Application/Services/PersonService.cs` | Implementación del servicio de aplicación |
| `api/Application/DTOs/PersonListItemDto.cs` | DTO para listado de personas |
| `api/Infrastructure/Repositories/PersonRepository.cs` | Implementación del repositorio |
| `api/Api/Controllers/AdminPersonsController.cs` | Controller con endpoints administrativos |

### Decisiones relevantes

- Paginación obligatoria en GET
- Búsqueda por nombre con operador Contains
- AsNoTracking en consultas de lectura
- Autenticación y rol Administrator requeridos

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe repositorio de `Person` con las operaciones necesarias
- [x] Existe servicio de aplicación para `Person`
- [x] Existe `GET /api/admin-persons`
- [x] El GET permite buscar personas por nombre
- [x] El GET implementa paginación obligatoriamente
- [x] La paginación respeta el contrato estándar de los endpoints administrativos
- [x] Existe `POST /api/admin-persons`
- [x] El POST crea correctamente una persona
- [x] El POST devuelve el identificador de la persona creada
- [x] La persona creada puede utilizarse inmediatamente en el formulario de Número
- [x] Los endpoints requieren autenticación
- [x] Los endpoints requieren rol `Administrator`
- [x] No se implementa aquí `PersonByRole`
- [x] La solución compila correctamente
- [x] La documentación queda alineada con la implementación