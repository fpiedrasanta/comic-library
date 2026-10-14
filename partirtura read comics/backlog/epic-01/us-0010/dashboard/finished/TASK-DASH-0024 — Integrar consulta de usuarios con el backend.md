# TASK-DASH-0024 — Integrar consulta de usuarios con el backend

## Objetivo

Integrar la pantalla de consulta de usuarios con los endpoints definidos por el backend para US-0010.

## Alcance

Implementar en el frontend:

- Servicio/repository de consulta de usuarios.
- Tipos TypeScript correspondientes.
- Mapeo del request paginado.
- Mapeo del response paginado.
- Manejo de búsqueda.
- Manejo de filtros.
- Manejo de ordenamiento.
- Manejo de paginación.
- Manejo de errores.

La consulta debe enviar únicamente los parámetros necesarios.

Ejemplo conceptual:

```ts
{
  currentPage: 1,
  pageSize: 12,
  orderBy: "LastName",
  orderDir: "ASC",
  search: "Piedra",
  isBanned: true,
  isActive: true
}

Los siguientes parámetros son opcionales:

search
isBanned
isActive
orderBy
orderDir

Reglas

La consulta debe ejecutarse utilizando el usuario autenticado.
El frontend no debe implementar lógica de autorización propia para reemplazar la autorización del backend.
El endpoint debe ser tratado como una operación exclusivamente de lectura.
No deben agregarse endpoints de modificación de usuarios.

Criterios de aceptación

Existe un servicio/repository para consultar usuarios.
 Los tipos TypeScript representan correctamente request y response.
 La búsqueda se envía correctamente.
 Los filtros se envían correctamente.
 El ordenamiento se envía correctamente.
 La paginación se envía correctamente.
 Los parámetros opcionales no se envían cuando no corresponden.
  Los errores del backend se manejan de acuerdo con el patrón existente.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó el servicio `getUsers` en `auth.service.ts` con todos los parámetros del contrato.
- Se implementó el servicio `getUserById` para obtener el detalle de un usuario.
- Se crearon los tipos TypeScript: `UserListItem`, `UserListResponse`, `UserDetail`.
- La búsqueda se envía correctamente mediante el parámetro `search`.
- Los filtros se envían correctamente: `isActive`, `isBanned`.
- El ordenamiento se envía correctamente: `orderBy`, `orderDir`.
- La paginación se envía correctamente: `currentPage`, `pageSize`.
- Los parámetros opcionales no se envían cuando no corresponden.
- Los errores del backend se manejan según el patrón existente.
- La consulta se ejecuta utilizando el usuario autenticado.
- No se implementó lógica de autorización propia.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- La integración con el backend funciona correctamente.

### Files Modified
- `dashboard/types/auth.ts` (modificado)
- `dashboard/features/authentication/services/auth.service.ts` (modificado)

### Observations
- Se respetó el contrato de endpoints documentado en `project/endpoints.md`.
- No se agregaron endpoints de modificación de usuarios.
