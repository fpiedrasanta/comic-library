# TASK-API-0151 — Implementar endpoint de consulta individual de baneo

## ID
TASK-API-0151

## Título
Implementar endpoint de consulta individual de baneo

## Descripción
El `BansController` no expone un endpoint para consultar un baneo por su ID. Sin este endpoint, el Dashboard no puede cargar los datos para editar un baneo existente, resultando en `Method Not Allowed` al acceder a `/bans/{banId}/edit`.

## Resultado esperado
Nuevo endpoint `GET /api/bans/{banId}` operativo, documentado y protegido, que permite al Dashboard obtener el detalle de un baneo para pre-cargar el formulario de edición.

## Contexto relevante
- User Story: US-0011 — Administrar baneos
- Epic: EPIC-01 — Gestión de usuarios e identidad
- Documentación: `project/endpoints.md`, `project/endpoints-bans.md`
- Controller existente: `BansController`

## Dependencias
Ninguna.

## Criterios de aceptación
- [ ] Existe el endpoint `GET /api/bans/{banId}` en `BansController`.
- [ ] El endpoint retorna el baneo correspondiente al ID.
- [ ] El endpoint retorna 404 si el baneo no existe.
- [ ] El endpoint requiere autenticación y rol `Administrator`.
- [ ] El contrato está documentado en `project/endpoints.md` y `project/endpoints-bans.md`.
- [ ] El Dashboard puede consumir este endpoint para cargar el formulario de edición de baneo.

## Asignado a
API Agent

## Resultado

### Archivos modificados

1. **`api/Application/DTOs/BanDetailDto.cs`** (nuevo)
   - DTO para la respuesta del endpoint de detalle de baneo.

2. **`api/Application/Interfaces/IBanService.cs`**
   - Agregado método `GetByIdAsync(long banId, CancellationToken cancellationToken = default)`.

3. **`api/Application/Services/BanService.cs`**
   - Implementado `GetByIdAsync` que valida el ID, obtiene el baneo del repositorio y mapea a `BanDetailDto`.
   - Retorna 404 si el baneo no existe.

4. **`api/Api/Controllers/BansController.cs`**
   - Agregado endpoint `GET /api/bans/{banId}` con autorización de rol Administrator.

5. **`project/endpoints/endpoints-bans.md`**
   - Documentado el nuevo endpoint `GET /api/bans/{banId}`.

### Build
- Exitoso: 0 errores, 0 advertencias.

### Criterios de aceptación cumplidos
- [x] Existe el endpoint `GET /api/bans/{banId}` en `BansController`.
- [x] El endpoint retorna el baneo correspondiente al ID.
- [x] El endpoint retorna 404 si el baneo no existe.
- [x] El endpoint requiere autenticación y rol `Administrator`.
- [x] El contrato está documentado en `project/endpoints.md` y `project/endpoints-bans.md`.
- [x] El Dashboard puede consumir este endpoint para cargar el formulario de edición de baneo.
