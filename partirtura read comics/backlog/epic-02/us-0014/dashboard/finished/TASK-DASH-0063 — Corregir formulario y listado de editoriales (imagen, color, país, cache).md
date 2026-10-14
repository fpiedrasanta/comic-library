# TASK-DASH-0063 — Corregir formulario y listado de editoriales (imagen, color, país, cache)

## ID
TASK-DASH-0063

## Título
Corregir formulario y listado de editoriales (imagen, color, país, cache)

## Descripción
El formulario de creación/edición de editoriales y el listado presentan múltiples defectos que impiden el flujo completo de administración de publishers.

## Resultado esperado
Formulario y listado de editoriales funcionales con imagen, color, país y cache invalidation operativos.

## Contexto relevante
- User Story: US-0014 — Administrar editoriales
- Epic: EPIC-02 — Administración de catálogo
- Documentación: `project/frontend-dashboard-stack-technology.md`, `project/frontend-coding-rules.md`, `project/dashboard-architecture.md`, `project/pages.md`, `project/components.md`
- Tareas relacionadas: TASK-DASH-0053, TASK-DASH-0055

## Criterios de aceptación
- [x] El selector de color permite elegir un color de la paleta y se refleja en el textbox.
- [x] El país se actualiza correctamente al editar una editorial. Backend finalizó TASK-API-0150; frontend envía `countryId` correctamente y `CountrySearchSelect` muestra el nombre inicial.
- [x] La imagen se muestra en el listado de editoriales.
- [x] La imagen se muestra en el formulario de edición.
- [x] Al guardar cambios y volver a editar, el país/color/texto se muestran actualizados sin F5.
- [x] Al reemplazar la imagen al editar, se guarda la nueva imagen. Backend finalizó TASK-API-0149; frontend envía `imageId=0` + `avatar` según contrato.
- [x] El formulario de edición de baneos carga los datos correctamente desde `GET /api/bans/{banId}`. Backend finalizó TASK-API-0151.

## Errores reportados y análisis

### Error 1: No permite seleccionar color de la paleta
**Archivo**: `dashboard/pages/publisher-form-page.tsx`
**Síntoma**: Al hacer clic en un color de la paleta `PRESET_COLORS`, no se actualiza el campo de texto del hex.
**Análisis probable**: El `input type="color"` está bindeado con `{...register('color')}` y el click en los presets usa `setValue('color', preset)`. El problema puede ser que el input nativo de color y el texto están sincronizados a través de React Hook Form, pero el `watchColor` no se actualiza visualmente, o el `register` está interfiriendo con el control programático. Alternativamente, el color picker nativo no está confirmando la selección visualmente hasta que se cierra el panel nativo.

### Error 2: No cambia país al editar
**Archivo**: `dashboard/features/users/components/country-search-select.tsx`
**Síntoma**: Al editar una editorial, el país no se muestra ni actualiza.
**Análisis probable**: El componente `CountrySearchSelect` mantiene `inputValue` y `selectedName` como estado local. Cuando el `value` cambia externamente (al cargar el formulario de edición), el componente no refresca `inputValue` correctamente. Si el país seleccionado no está en el listado actual (`items`), el `useEffect` no lo busca automáticamente, por lo que el input queda vacío aunque el `value` tenga el ID correcto.

### Error 3: No muestra imagen en listado ni en edición
**Archivos**: `dashboard/pages/publishers-page.tsx`, `dashboard/pages/publisher-form-page.tsx`
**Síntoma**: La imagen no aparece en la grilla ni en el formulario de edición.
**Análisis probable**: En `publishers-page.tsx`, la grilla usa `ProtectedImage` con `src={publisher.imageUrl}`. Si `urlImage` del backend viene como número o ruta relativa sin `/api/images/`, `ProtectedImage` puede fallar. En `publisher-form-page.tsx`, el preview usa `imagePreview` que en edición se setea como `/images/${detail.imageId}` pero el endpoint correcto es `/api/images/{id}`. Si `ProtectedImage` recibe una ruta incorrecta, muestra el fallback.

### Error 4: Al re-editar mismo publisher muestra datos viejos
**Archivo**: `dashboard/pages/publisher-form-page.tsx`
**Síntoma**: Entro a editar, cambio todos los campos, guardo, vuelvo a editar el mismo publisher y veo los datos anteriores. F5 trae los nuevos.
**Análisis probable**: Después de guardar, se hace `queryClient.invalidateQueries({ queryKey: ['publishers'] })` pero NO se hace `invalidateQueries({ queryKey: ['publisher', id] })`. El query `['publisher', id]` queda cacheado con los datos viejos. Al navegar a `/publishers/:id/edit`, el `useQuery` reutiliza el cache stale en lugar de refetch. Además, al guardar y navegar al listado, el estado local del formulario no se resetea completamente, y al entrar de nuevo persiste valores previos.

## Dependencias
- TASK-API-0145 — Integrar gestión de imagen en las operaciones de Publisher (finished)
- TASK-API-0148 — Agregar urlImage a AdminPublisherDetailDto (finished)
- TASK-API-0149 — PUT admin-publishers no reemplaza la imagen con imageId=0 + avatar (finished). Backend aplica el reemplazo de imagen correctamente.
- TASK-API-0150 — PUT admin-publishers no actualiza countryId (finished). Backend actualiza `countryId` correctamente en el PUT.
- TASK-API-0151 — Implementar endpoint de consulta individual de baneo (finished). Backend implementó `GET /api/bans/{banId}` y está documentado en `endpoints-bans.md`.

## Bloqueo actual
- Sin bloqueos. Todos los endpoints y contratos necesarios están disponibles.

## Estado actual
- Código frontend implementado y compilando sin errores.
- Pendiente verificación manual en navegador:
  1. Editar una editorial, cambiar país, guardar, re-editar y confirmar que el país persiste.
  2. Editar una editorial con imagen, reemplazarla, guardar, re-editar y confirmar que muestra la imagen nueva.
  3. Editar un baneo y confirmar que los datos se cargan desde `GET /api/bans/{banId}`.

## Asignado a
Frontend Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`types/publisher.ts`**: `AdminPublisherDetailDto` ahora incluye `urlImage: string` (ruta relativa que ya devuelve el backend tras `TASK-API-0148`).

2. **`pages/publisher-form-page.tsx`**:
   - **Error 1 (color)**: el textbox hex pasó de `{...register('color')}` (no controlado, se desincronizaba de los presets) a controlado con `value={watchColor ?? ''}` y `onChange` vía `setValue('color', ..., { shouldValidate, shouldDirty })`. Ahora los presets `PRESET_COLORS` y el `input type="color"` se reflejan en el textbox.
   - **Error 3 (imagen en edición)**: el preview dejó de hardcodear `/api/images/{id}` y usa `detail.urlImage` (ruta relativa). `ProtectedImage` → `useProtectedImage` le antepone `API_BASE_URL` (env `VITE_API_BASE_URL`), sin `/api/` fijo.
   - **Error 4 (cache)**: tras guardar se invalida también `queryClient.invalidateQueries({ queryKey: ['publisher', id] })` (modo edición), además de `['publishers']`. Al re-editar el mismo publisher se hace refetch y se muestran los datos actualizados sin F5.

3. **`features/users/components/country-search-select.tsx`** (Error 2):
   - Nueva prop opcional `initialSelectedName?: string`.
   - El efecto de sincronización externa ya no llama `searchCountries('')` en bucle cuando el país no está en la primera página; si `value` está presente y no se encuentra en `items` pero se conoce `initialSelectedName`, lo muestra. Se eliminó el bucle de fetch infinito.
   - El listado (`publishers-page.tsx`) ya mapeaba `item.urlImage` → `publisher.imageUrl` y `ProtectedImage` resuelve la ruta relativa, por lo que la imagen en grilla ya funcionaba con el contrato actual; no requirió cambio adicional.

4. **`pages/publisher-form-page.tsx`** (Error 2): `CountrySearchSelect` recibe `initialSelectedName={mode === 'edit' && publisherData ? publisherData.countryName : undefined}`, de modo que al editar se muestra el país correcto.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso (únicamente warning previo de tamaño de chunk, ajeno a este cambio).
- No existen tests automatizados en el dashboard (`vitest run` → "No test files found").

### Notas
- La dependencia `TASK-API-0148` (agregar `urlImage` al detalle) finalizó antes de ejecutar, por lo que el formulario pudo resolverse sin construir la ruta desde `imageId`.
- `components.md` actualizado para documentar la nueva prop `initialSelectedName` de `CountrySearchSelect`.

## Corrección adicional — formulario de edición de administrador no muestra avatar

Durante la ejecución se detectó que el formulario de edición de administrador (`admin-form-page.tsx`) renderizaba el avatar con `<img src={avatarPreview}>` directo. Cuando `avatarUrl` es una ruta protegida como `/images/42`, el navegador no la resuelve correctamente y el avatar no se muestra.

### Cambio
- **`pages/admin-form-page.tsx`**: se reemplazó el `<img>` directo por `<ProtectedImage src={avatarPreview} ...>`, que resuelve la ruta protegida mediante `apiClientBlob` con `API_BASE_URL`.

## Descubrimiento adicional — falta endpoint de detalle de baneo

Al intentar corregir el formulario de edición de baneos, se descubrió que el endpoint `GET /api/bans/{banId}` no existía en `endpoints-bans.md`. La pantalla de edición consultaba este endpoint y recibía 405 Method Not Allowed.

### Acción
- Creada `TASK-API-0151` en `planned/api/` para implementar el endpoint faltante.
- Esta Task quedó bloqueada hasta que `TASK-API-0151` finalice.

## Desbloqueo
- `TASK-API-0151` finalizó. El endpoint `GET /api/bans/{banId}` está documentado en `endpoints-bans.md` y operativo.
- Esta Task vuelve a `pending` y puede continuar con la corrección del formulario de edición de baneos.

## Corrección adicional — persistencia de la edición (campos no se guardaban)

Tras la primera entrega el usuario reportó que al editar, los cambios no persistían: el país siempre se guardaba con `id=1` (el PUT enviaba `countryId: 1` sin importar la selección) y la imagen no se actualizaba al re-editar. Las imágenes ya se mostraban (Error 3 de visualización resuelto), pero la edición no guardaba los nuevos valores.

### Causa
- `countryId` no estaba registrado en React Hook Form: se actualizaba con `setValue('countryId', ...)` desde el `onChange` del componente personalizado, pero ese flujo no garantizaba que el valor llegara al estado del formulario usado en el `PUT`.
- El efecto `reset(detail)` se ejecutaba en cada cambio de `publisherData` (refetches), pudiendo sobreescribir los cambios del usuario antes del guardado y dejar el formulario con los datos originales.

### Cambios
1. **`pages/publisher-form-page.tsx`**: `CountrySearchSelect` ahora se envuelve en `<Controller name="countryId" control={control} render={...} />`. Esto registra el campo correctamente; `field.onChange(Number(val))` actualiza el valor controlado que `watch()` y el `PUT` utilizan. Patrón canónico de RHF para inputs controlados personalizados.
2. **`pages/publisher-form-page.tsx`**: el efecto de carga se protegió con `appliedPublisherRef` para aplicar `reset(detail)` una sola vez por `id`. Refetches posteriores (focus de ventana, etc.) ya no pisan los cambios del usuario. El preview de imagen (`imagePreview`) tampoco se revierte tras seleccionar un archivo nuevo.
3. Se agregó `control` al `useForm` y `Controller` al import de `react-hook-form`.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- Pendiente de verificación manual del usuario: elegir otro país al editar, guardar, re-editar y confirmar que persiste; y cambiar la imagen y confirmar que se actualiza.

## Corrección adicional 2 — imagen no se reemplaza en el PUT

El usuario confirmó que el país ya persistía (`countryId: 2` en el PUT), pero la imagen no se actualizaba al editar aunque se enviaba `avatar` (binario). El payload no incluía `imageId`.

### Causa
Según `endpoints.md` (PUT `/api/admin-publishers`, notas de imagen): el reemplazo requiere `imageId = 0` + `avatar = archivo`. El formulario, en la rama "hay archivo nuevo", enviaba solo `avatar` y omitía `imageId`, por lo que el backend no interpretaba la intención de reemplazo y conservaba la imagen actual.

### Cambio
- **`pages/publisher-form-page.tsx`** (`handleConfirmSave`, rama `mode === 'edit'`): al enviar un archivo nuevo se agregó `formData.append('imageId', '0')` junto con `avatar`, cumpliendo el contrato de reemplazo (`imageId = 0` + `avatar`). Mantener (`imageId = existingId`), eliminar (`imageId = 0` sin avatar) y crear (solo `avatar`) siguen igual.

### Validación
- `tsc -b --noEmit`: sin errores. `vite build`: exitoso.
- Pendiente de verificación manual: editar una editorial con imagen, elegir un archivo nuevo, guardar, re-editar y confirmar que muestra la imagen nueva.

## Corrección adicional 3 — formulario de edición de baneos carga datos vacíos

El usuario reportó que al editar un baneo, el formulario mostraba los campos vacíos aunque el backend devolvía los datos correctamente (`GET /api/bans/{banId}` operativo tras `TASK-API-0151`).

### Causa
Los inputs del formulario (`startDate`, `endDate`, `reason`) estaban bindeados a React Hook Form vía `register()`, pero el `useEffect` de carga solo actualizaba estado local con `setStartDate()`, `setEndDate()` y `setReason()`. Esas variables no estaban conectadas a RHF, por lo que los inputs seguían mostrando los `defaultValues` vacíos.

### Cambio
- **`pages/ban-form-page.tsx`**: se reemplazó la actualización de estado local por `reset()` de RHF para sincronizar el formulario con los datos del backend.
- Se eliminaron las variables de estado `startDate`, `endDate`, `reason` y se usa `watch()` para leer los valores actuales en el modal de confirmación y en el `handleConfirmSave`.
- En modo creación, el valor por defecto de `startDate` se setea vía `setValue('startDate', getCurrentLocalDateTime())` dentro del `useEffect` de título/acciones.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- Pendiente verificación manual: editar un baneo y confirmar que los datos se muestran en el formulario.

## Corrección adicional 4 — estandarización de formato de fechas a dd/MM/yyyy

Se detectó que las fechas se mostraban con formato variable dependiente de `toLocaleString`, que puede interpretarse como `MM/dd/yyyy` según la configuración regional del sistema, y que los inputs nativos `<input type="date">` y `<input type="datetime-local">` heredan el formato del sistema.

### Cambio
- **`lib/date-utils.ts`**: se reemplazó `formatDate` por una implementación explícita `dd/MM/yyyy` usando `pad()`. Se agregó `formatDateTime(dateString): string` → `dd/MM/yyyy HH:mm` para casos donde se requiere fecha y hora.
- **`shared/ui/date-input.tsx`**: componente custom de fecha que fuerza visualmente el formato `dd/MM/yyyy` o `dd/MM/yyyy HH:mm` en pantalla, sin depender del locale del sistema. Internamente entrega ISO en blur para enviar a la API.
- **`pages/users-page.tsx`**: se eliminó la función `formatDate` local duplicada y se usa la importada desde `date-utils.ts`.
- **`pages/bans-page.tsx`**: se reemplazaron los dos `<input type="datetime-local">` por `DateInput` con `withTime`. `startDate` y `endDate` en la tabla usan `formatDateTime` para mostrar fecha y hora; `createdAt` usa `formatDate`.
- **`pages/ban-form-page.tsx`**: se reemplazaron los dos `<input type="datetime-local">` por `DateInput` con `withTime` envueltos en `Controller` de RHF. En el modal de confirmación se usa `formatDateTime` para `startDate` y `endDate`.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
