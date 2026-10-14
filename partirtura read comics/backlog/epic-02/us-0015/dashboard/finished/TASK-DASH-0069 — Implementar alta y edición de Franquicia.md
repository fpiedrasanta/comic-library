# TASK-DASH-0069 — Implementar alta y edición de Franquicia

Implementar el formulario de creación y edición de Franquicias utilizando como referencia la maqueta:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\formulario-franquicia.html

El formulario debe funcionar en dos modos:

- Crear Franquicia.
- Editar Franquicia.

Debe contemplar los campos definidos por el dominio y los contratos de API:

- Name.
- Description.
- PublisherId.
- IsOngoing.
- Color.
- IsFeatured.
- Imagen.

### Editorial

`PublisherId` es obligatorio.

El formulario debe permitir seleccionar una editorial mediante la pantalla de selección definida en `seleccionar-editorial.html`.

En creación:

```text
Nueva Franquicia
    ↓
Seleccionar Editorial
    ↓
Formulario de Franquicia

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

1. **`features/franchises/services/franchise.service.ts`**: se agregaron `createFranchise(formData)` y `updateFranchise(franchiseId, formData)` para enviar `multipart/form-data` a los endpoints POST y PUT respectivamente. Sigue la misma estructura que `publisher.service.ts`.

2. **`pages/franchise-form-page.tsx`**: actualizada para:
   - Enviar `FormData` real al servicio en lugar de simular con `setTimeout`.
   - Modo create: usa `createFranchise()` con campos `name`, `description`, `publisherId`, `color`, `isFeatured`, `isOngoing`, y `avatar` cuando hay imagen nueva.
   - Modo edit: usa `updateFranchise()` con `imageId` y `avatar` según el contrato:
     - Imagen nueva: `imageId = 0` + `avatar = file`
     - Imagen eliminada: `imageId = 0` + sin `avatar`
     - Imagen conservada: `imageId = existingImageId` + sin `avatar`
   - Manejo de errores del backend con mensaje real en la UI.
   - Toast de éxito y redirección al listado.

3. **`types/franchise.ts`**: ya existía, alineado al contrato.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
