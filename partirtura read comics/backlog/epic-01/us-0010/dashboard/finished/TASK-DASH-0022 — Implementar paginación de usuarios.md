# TASK-DASH-0022 — Implementar paginación de usuarios

## Objetivo

Implementar la paginación del listado de usuarios de acuerdo con el contrato paginado del backend.

## Parámetros

La consulta debe soportar:

- `currentPage`
- `pageSize`

El tamaño inicial de página será de 12 usuarios, de acuerdo con el template.

## Controles

Implementar:

- Primera página.
- Página anterior.
- Número de página editable.
- Página siguiente.
- Última página.

Mostrar además:

- Cantidad de registros mostrados.
- Cantidad total de usuarios.
- Página actual.
- Cantidad total de páginas.

## Reglas

Al cambiar de página deben conservarse:

- Búsqueda.
- Filtros.
- Ordenamiento.

## Criterios de aceptación

- [ ] El listado comienza en la página 1.
- [ ] Se muestran 12 usuarios por página inicialmente.
- [ ] Es posible avanzar y retroceder.
- [ ] Es posible ir a la primera página.
- [ ] Es posible ir a la última página.
- [ ] Es posible ingresar directamente un número de página válido.
- [ ] Los controles se deshabilitan cuando corresponde.
- [ ] Los filtros actuales se conservan al cambiar de página.
- [ ] El ordenamiento actual se conserva al cambiar de página.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó la paginación completa con controles: primera página, anterior, número editable, siguiente, última página.
- Se muestra información de registros: cantidad mostrada, total de usuarios, página actual, total de páginas.
- El tamaño de página inicial es de 12 usuarios.
- Los controles se deshabilitan correctamente en los límites.
- Los filtros, búsqueda y ordenamiento se conservan al cambiar de página.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- La paginación funciona correctamente con el endpoint `GET /api/users`.

### Files Modified
- `dashboard/pages/users-page.tsx` (creado)

### Observations
- Se respeta el contrato de paginación del backend.
- El número de página es editable con validación de rango.
