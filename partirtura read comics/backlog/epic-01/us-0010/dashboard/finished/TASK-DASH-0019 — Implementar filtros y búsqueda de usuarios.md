# TASK-DASH-0019 — Implementar filtros y búsqueda de usuarios

## Objetivo

Implementar la sección de búsqueda y filtros de la pantalla de consulta de usuarios.

## Alcance

Implementar:

### Buscador

Un buscador genérico que permita buscar usuarios por:

- Apellido.
- Email.

El valor debe enviarse mediante el parámetro `search`.

### Filtros

Implementar los siguientes filtros:

- Estado:
  - Todos.
  - Activo.
  - Inactivo.

- Baneado:
  - Todos.
  - Sí.
  - No.

Los filtros deben mapearse respectivamente a:

- `isActive`
- `isBanned`

## Reglas

Todos los parámetros de búsqueda y filtros son opcionales.

Cuando no se establezca un filtro, no debe enviarse como una restricción al backend.

## Criterios de aceptación

- [ ] El buscador permite buscar por apellido.
- [ ] El buscador permite buscar por email.
- [ ] Existe filtro de estado.
- [ ] Existe filtro de baneo.
- [ ] Los filtros pueden combinarse.
- [ ] Es posible consultar sin aplicar filtros.
- [ ] La búsqueda y los filtros actualizan el listado.
- [ ] No se envían parámetros innecesarios cuando el filtro está vacío.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó el buscador por apellido y email mediante el parámetro `search`.
- Se implementaron los filtros de estado (`isActive`) y baneo (`isBanned`).
- Los filtros pueden combinarse entre sí.
- Es posible consultar sin aplicar filtros.
- La búsqueda y los filtros actualizan el listado.
- No se envían parámetros innecesarios cuando el filtro está vacío.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- Los filtros se integran correctamente con el endpoint `GET /api/users`.

### Files Modified
- `dashboard/pages/users-page.tsx` (creado)

### Observations
- Se reutilizaron componentes y estilos existentes del Dashboard.
