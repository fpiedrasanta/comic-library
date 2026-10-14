# TASK-API-0086 — Implementar consulta de usuarios en UserRepository

## Objetivo

Implementar en `UserRepository` la consulta paginada de usuarios requerida por el Dashboard.

## Trabajo a realizar

1. Implementar la consulta sobre `User`.
2. Aplicar búsqueda por apellido o email cuando `search` tenga valor.
3. Aplicar filtro por `IsActive` cuando corresponda.
4. Aplicar filtro por baneo vigente cuando corresponda.
5. Calcular la cantidad histórica de baneos de cada usuario.
6. Determinar si el usuario posee actualmente un baneo vigente.
7. Aplicar el ordenamiento solicitado.
8. Aplicar paginación.
9. Proyectar únicamente los datos necesarios para el response.

## Reglas

- No cargar entidades completas si no son necesarias.
- Evitar N+1 queries.
- No modificar ninguna entidad durante la consulta.
- `isBanned` debe considerar únicamente baneos cuya fecha actual esté dentro del período de vigencia.
- Un baneo con `endDate = null` permanece vigente indefinidamente desde `startDate`.
- `banCount` debe contar todos los baneos históricos del usuario, independientemente de que estén vencidos o vigentes.

## Criterios de aceptación

- [ ] La consulta es paginada.
- [ ] La búsqueda funciona por apellido.
- [ ] La búsqueda funciona por email.
- [ ] Los filtros `IsActive` e `IsBanned` funcionan independientemente.
- [ ] El ordenamiento funciona sobre los campos permitidos.
- [ ] `CreatedAt DESC` es el ordenamiento por defecto.
- [ ] `banCount` representa la cantidad histórica de baneos.
- [ ] `isBanned` representa el estado actual.
- [ ] No existen consultas N+1 para obtener información de baneos.
- [ ] La operación es exclusivamente de lectura.

## Execution Result

### Status
Finished

### Completed Work
- Método `GetPagedAsync` agregado a `IUserRepository` y `UserRepository`.
- La consulta soporta búsqueda por apellido y email.
- La consulta soporta filtro por `IsActive`.
- La consulta soporta filtro por baneo vigente (`IsBanned`) utilizando subquery sobre `Bans`.
- La consulta aplica ordenamiento por `LastName`, `CreatedAt` y por defecto `CreatedAt DESC`.
- La consulta aplica paginación.
- La operación es de solo lectura (`AsNoTracking`).
- No existen consultas N+1 para la obtención de usuarios.

### Pending Work
Ninguna. La consulta en `UserRepository` está implementada.

### Unblocked by
TASK-API-0090 - Definir entidad Ban y repositorio base

### Assigned to
Backend Agent