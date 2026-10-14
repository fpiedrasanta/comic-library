# TASK-DASH-0067 — Implementar listado de franquicias

Implementar la pantalla de listado de franquicias utilizando como referencia la maqueta:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-franquicias.html

La pantalla debe integrarse con los endpoints definidos para Franquicias en `project/endpoints.md`.

Debe permitir:

- Consultar franquicias mediante el endpoint paginado.
- Buscar por nombre de franquicia, nombre de editorial y nombre del país de la editorial.
- Filtrar por `IsFeatured`.
- Filtrar por `IsOngoing`.
- Filtrar por `IsActive`.
- Ordenar por:
  - Nombre de franquicia.
  - Nombre del país de la editorial.
  - Nombre de la editorial.
- Seleccionar dirección ASC/DESC.
- Utilizar paginación del backend.
- Mostrar imagen de la franquicia cuando exista.
- Mostrar nombre.
- Mostrar editorial.
- Mostrar color mediante una muestra circular.
- Mostrar `IsFeatured` mediante check verde o cruz roja.
- Mostrar `IsOngoing` mediante check verde o cruz roja.
- Mostrar `IsActive` mediante check verde o cruz roja.
- Permitir editar una franquicia.
- Permitir desactivar una franquicia.
- Permitir reactivar una franquicia.
- Mostrar confirmación antes de desactivar o reactivar.
- Mantener búsqueda, filtros y ordenamiento después de una activación/desactivación.

La comunicación HTTP debe implementarse utilizando los servicios y patrones existentes en el Dashboard.

No modificar `project/endpoints.md`. El documento es de consulta para el Frontend Agent.

Actualizar los artefactos de frontend correspondientes (`pages.md`, `components.md` y documentación equivalente existente) cuando corresponda.

La implementación debe contemplar los estados de loading, error y resultado vacío.

Validar la solución mediante `tsc` y `vite build`.

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

1. **`features/franchises/services/franchise.service.ts`**: servicio real con `getFranchises()` y `getFranchiseById()` usando `apiClient`. Mapea parámetros de frontend (`name`, `publisherCountryName`, `publisherName`) a los valores del backend (`Name`, `PublisherCountry`, `PublisherName`).

2. **`pages/franchises-page.tsx`**: actualizada para consumir el servicio real. Las acciones de desactivar/reactivar ahora llaman a `deactivateFranchise()` y `activateFranchise()` del servicio, con manejo de errores y refresco de query.

3. **`types/franchise.ts`**: tipos alineados al contrato `endpoints-franchises.md`.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
