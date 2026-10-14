# TASK-DASH-0025 — Implementar resolución de imágenes protegidas mediante Blob

## Objetivo

Implementar en Dashboard un mecanismo reutilizable para mostrar imágenes protegidas provenientes del backend que requieren autenticación mediante Access Token.

El backend expone imágenes mediante:

`GET /api/images/{id}`

Este endpoint requiere autenticación mediante Bearer Token.

Debido a que un elemento HTML `<img>` no permite agregar manualmente el header `Authorization`, las imágenes protegidas no deben asignarse directamente como `src`.

La implementación debe tomar como referencia la solución ya implementada en Public Web mediante:

- `project/components.md`, especialmente la documentación del componente `ProtectedImage`.
- `TASK-PUBLIC-WEB-0039 — Implementar resolución de imágenes protegidas mediante Blob`.

El objetivo no es duplicar código ciegamente, sino revisar la solución existente y aplicar el mismo criterio arquitectónico al Dashboard respetando su estructura, API Client y mecanismo de autenticación.

## Alcance

### Revisión de la implementación existente

Antes de implementar, revisar:

- `project/components.md`, sección correspondiente a `ProtectedImage`.
- `TASK-PUBLIC-WEB-0039 — Implementar resolución de imágenes protegidas mediante Blob`.
- Implementación de `fetchApiBlob` en Public Web.
- Implementación de `use-protected-image.ts`.
- Implementación de `protected-image.tsx`.

Determinar cómo aplicar este mecanismo en Dashboard sin introducir un segundo mecanismo de autenticación ni realizar llamadas HTTP directas desde componentes.

Si existe una posibilidad razonable de compartir código entre Public Web y Dashboard sin violar la arquitectura actual de ambos frontends, documentarla y evaluarla antes de implementarla.

Si compartir código no resulta conveniente por la separación actual de aplicaciones, implementar la solución equivalente dentro del Dashboard.

## Comportamiento requerido

El mecanismo debe distinguir entre:

### Imagen protegida del backend

Ejemplo:

`/images/123`

Debe:

1. Solicitarse mediante el API Client centralizado del Dashboard.
2. Enviar el Access Token mediante `Authorization: Bearer <token>`.
3. Obtenerse como `Blob`.
4. Convertirse mediante `URL.createObjectURL()`.
5. Utilizarse como `src` del `<img>`.
6. Liberarse mediante `URL.revokeObjectURL()` cuando deje de utilizarse.

### Imagen externa

Ejemplo:

`https://lh3.googleusercontent.com/...`

Debe utilizarse directamente como `src`.

No debe descargarse mediante el API Client ni convertirse innecesariamente en Blob.

### Sin imagen

Cuando `avatarUrl` sea `null`, `undefined` o vacío:

- No realizar ninguna request.
- Utilizar el fallback visual definido por el Dashboard.

## Reutilización

La solución debe ser reutilizable por cualquier componente del Dashboard que necesite mostrar imágenes protegidas.

Como mínimo deberá permitir su utilización en:

- Avatar del usuario en la grilla de consulta de usuarios.
- Avatar ampliado del usuario en el modal de detalle.
- Avatar del usuario autenticado en el layout/header/sidebar, si corresponde.
- Cualquier futura pantalla administrativa que muestre imágenes protegidas.

No implementar la lógica específicamente dentro de `SettingsPage`, `UsersPage` o del modal de usuarios.

## Seguridad

- No agregar tokens a query strings.
- No agregar el Access Token manualmente a la URL.
- No almacenar tokens ni imágenes en `localStorage`.
- No crear un mecanismo paralelo de autenticación.
- Utilizar el mecanismo existente de autenticación del Dashboard.
- Utilizar el API Client centralizado.
- No realizar llamadas `fetch` directas desde páginas o componentes.

## Gestión del ciclo de vida

La implementación debe contemplar correctamente el ciclo de vida de las Object URLs.

Cuando una imagen protegida deje de utilizarse, debe ejecutarse:

`URL.revokeObjectURL()`

La implementación no debe revocar una Object URL mientras todavía esté siendo utilizada por un elemento `<img>`.

También debe contemplar correctamente el cambio de una imagen protegida a otra imagen, a una imagen externa o a `null`.

## Manejo de errores

- Si la imagen protegida devuelve `401`, utilizar el mecanismo existente de sesión/autenticación del Dashboard.
- Si devuelve `404`, tratar la imagen como no disponible.
- No mostrar errores técnicos de infraestructura al usuario.
- No exponer headers, tokens ni detalles internos de la API.
- Utilizar el mecanismo centralizado de manejo de errores existente cuando corresponda.

## Arquitectura

La implementación debe:

- Respetar la arquitectura actual del Dashboard.
- Reutilizar el API Client existente.
- No crear un segundo cliente HTTP.
- No agregar lógica de autenticación al componente visual.
- Mantener separada la resolución de la imagen de su presentación visual.
- Evitar duplicar la lógica de Blob/Object URL en cada página.
- Mantener una abstracción reutilizable.

El componente visual no debería necesitar conocer si una imagen es protegida o externa más allá de recibir el `avatarUrl`.

## Integración con la consulta de usuarios

La implementación deberá soportar correctamente los valores de `avatarUrl` devueltos por:

`GET /api/users`

Ejemplos:

`/images/123`

→ imagen protegida → API Client → Blob → Object URL.

`https://lh3.googleusercontent.com/...`

→ imagen externa → `<img src="...">`.

`null`

→ fallback visual → sin request.

La solución debe permitir utilizar el mismo `avatarUrl` tanto en la card de usuario como en el modal de detalle.

## Documentación

Si se crea un componente o hook reutilizable:

- Actualizar `project/components.md` para documentarlo.
- No modificar innecesariamente la documentación existente de Public Web.

Si la implementación establece una regla general nueva para Dashboard:

- Evaluar si corresponde documentarla en `project/frontend-coding-rules.md`.

## Criterios de aceptación

- [ ] Se revisó `project/components.md` y la implementación documentada de `ProtectedImage`.
- [ ] Se revisó `TASK-PUBLIC-WEB-0039`.
- [ ] Se determinó si corresponde reutilizar código o implementar una solución equivalente en Dashboard.
- [ ] Una URL `/images/{id}` puede mostrarse correctamente en un `<img>`.
- [ ] La request al backend incluye el Bearer Token mediante el API Client existente.
- [ ] La imagen se obtiene como Blob.
- [ ] Se genera correctamente una Object URL.
- [ ] La Object URL se libera correctamente cuando deja de utilizarse.
- [ ] Una URL HTTPS externa se muestra directamente.
- [ ] `null` / `undefined` no generan requests.
- [ ] No existen llamadas `fetch` directas desde componentes o páginas para resolver imágenes.
- [ ] No se almacenan tokens ni imágenes en almacenamiento persistente.
- [ ] La solución puede reutilizarse tanto en la grilla como en el modal de usuarios.
- [ ] La solución respeta la arquitectura del Dashboard.
- [ ] TypeScript compila correctamente.

## NOTAS

Si durante la revisión se detecta que:

- conviene modificar el componente existente de Public Web,
- conviene extraer una librería compartida,
- el API Client del Dashboard necesita cambios estructurales,
- existe una diferencia arquitectónica que requiere una decisión,
- o existe cualquier otro cambio que exceda el alcance de esta task,

no realizar el cambio unilateralmente.

En ese caso, generar una nueva task en `planned`, dirigida al Human, explicando:

- problema detectado,
- alternativa propuesta,
- impacto,
- y decisión requerida.

Si no existe ningún impedimento arquitectónico, implementar la solución y mover esta task a `finished`.

## Execution Result

### Status
Finished

### Completed Work
- Se revisó la implementación existente en Public Web (`ProtectedImage`, `use-protected-image`, `fetchApiBlob`).
- Se determinó que no corresponde compartir código directamente entre Public Web y Dashboard debido a la separación actual de aplicaciones y las diferencias en sus API Clients.
- Se implementó la solución equivalente en Dashboard:
  - Se agregó `apiClientBlob` al API Client del Dashboard para obtener Blobs con autenticación Bearer.
  - Se creó el hook `use-protected-image.ts` para gestionar el ciclo de vida de Object URLs.
  - Se creó el componente `ProtectedImage` para mostrar imágenes protegidas y externas.
- Una URL `/images/{id}` se solicita mediante el API Client, se envía el Bearer Token, se obtiene como Blob, se convierte a Object URL y se asigna al `src` del `<img>`.
- La Object URL se libera correctamente mediante `URL.revokeObjectURL()` cuando deja de utilizarse.
- Las URLs HTTPS externas se muestran directamente sin conversión a Blob.
- `null` / `undefined` no generan requests y utilizan el fallback visual.
- No existen llamadas `fetch` directas desde componentes o páginas.
- No se almacenan tokens ni imágenes en almacenamiento persistente.
- La solución se integra en la grilla de usuarios y en el modal de detalle.
- La solución respeta la arquitectura del Dashboard.
- TypeScript compila correctamente.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- La solución es reutilizable por cualquier componente del Dashboard.

### Files Modified
- `dashboard/infrastructure/api/client/api-client.ts` (modificado)
- `dashboard/hooks/use-protected-image.ts` (creado)
- `dashboard/components/protected-image.tsx` (creado)
- `dashboard/pages/users-page.tsx` (modificado)

### Files Created
- `dashboard/hooks/use-protected-image.ts`
- `dashboard/components/protected-image.tsx`

### Observations
- Se evaluó compartir código entre Public Web y Dashboard, pero se determinó que no es conveniente por la separación actual de aplicaciones.
- Se implementó la solución equivalente dentro del Dashboard respetando su arquitectura.
