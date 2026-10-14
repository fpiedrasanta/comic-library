# TASK-PUBLIC-WEB-0039 — Implementar resolución de imágenes protegidas mediante Blob

## Objetivo

Implementar un mecanismo reutilizable en Public Web para mostrar imágenes protegidas del backend que requieren autenticación mediante Access Token.

El backend expone imágenes mediante:

`GET /api/images/{id}`

Este endpoint requiere autenticación mediante Bearer Token.

Debido a que un elemento HTML `<img>` no permite agregar manualmente el header `Authorization`, las imágenes protegidas no deben asignarse directamente como `src`.

## Alcance

- Crear una abstracción reutilizable para obtener imágenes protegidas mediante el API Client existente.
- Utilizar exclusivamente el API Client centralizado para solicitar las imágenes.
- Permitir que el API Client envíe automáticamente el Access Token mediante el header `Authorization`.
- Obtener la respuesta HTTP como `Blob`.
- Crear una URL temporal mediante `URL.createObjectURL()`.
- Exponer esa URL para que pueda utilizarse como `src` de un elemento `<img>`.
- Liberar la URL temporal mediante `URL.revokeObjectURL()` cuando la imagen deje de utilizarse.
- Evitar duplicar esta lógica en las páginas o componentes que necesiten mostrar imágenes protegidas.

## Diferenciación entre imágenes protegidas y externas

El mecanismo debe distinguir entre:

### Imagen protegida del backend

Ejemplo:

`/images/123`

Debe:

1. Solicitarse mediante el API Client.
2. Enviar el Access Token mediante `Authorization: Bearer <token>`.
3. Obtenerse como `Blob`.
4. Convertirse mediante `URL.createObjectURL()`.
5. Utilizarse como `src` del `<img>`.

### Imagen externa

Ejemplo:

`https://lh3.googleusercontent.com/...`

Debe utilizarse directamente como `src`.

No debe descargarse mediante el API Client ni convertirse innecesariamente en Blob.

## Seguridad

- No agregar tokens a query strings.
- No agregar el Access Token manualmente a la URL.
- No almacenar imágenes ni tokens en `localStorage`.
- No crear un mecanismo paralelo de autenticación.
- Utilizar el mecanismo existente de almacenamiento y envío del Access Token.
- Utilizar el API Client centralizado.
- No realizar llamadas `fetch` directas desde componentes o páginas.

## Gestión del ciclo de vida

La implementación debe contemplar correctamente el ciclo de vida de las Object URLs.

Cuando una imagen protegida deje de utilizarse, debe ejecutarse:

`URL.revokeObjectURL()`

para evitar acumulación innecesaria de recursos en el navegador.

La implementación debe evitar revocar una URL mientras todavía está siendo utilizada por un elemento `<img>`.

## Reutilización

La solución debe poder ser utilizada posteriormente por cualquier componente que necesite mostrar una imagen protegida, por ejemplo:

- Avatar del usuario.
- Avatar en Mi Perfil.
- Avatares de otros usuarios.
- Portadas almacenadas en el backend.
- Imágenes asociadas a entidades futuras.

No implementar esta lógica específicamente para el avatar del Index.

## Integración con avatar

El mecanismo debe soportar correctamente los valores que devuelve el backend mediante `avatarUrl`.

Ejemplos:

`/images/123`

→ imagen protegida → API Client → Blob → Object URL.

`https://lh3.googleusercontent.com/...`

→ imagen externa → `<img src="...">`.

`null`

→ no existe imagen → utilizar el comportamiento visual definido por la interfaz para usuarios sin avatar.

## Manejo de errores

- Si la imagen protegida devuelve `401`, utilizar el mecanismo existente de sesión/autenticación.
- Si devuelve `404`, tratar la imagen como no disponible.
- No mostrar errores técnicos al usuario.
- No exponer headers, tokens ni detalles internos de la API.
- Utilizar el mecanismo centralizado de manejo de errores existente cuando corresponda.

## Arquitectura

- Reutilizar el API Client existente.
- No crear un segundo cliente HTTP.
- No agregar lógica de autenticación al componente visual.
- La página o componente que muestra la imagen no debe conocer cómo se obtiene el Blob.
- La implementación debe respetar las reglas existentes de frontend y separación de responsabilidades.

## Documentación

Actualizar `project/components.md` únicamente si se crea un componente reutilizable específico para imágenes protegidas.

Actualizar `project/frontend-coding-rules.md` únicamente si esta implementación establece una nueva regla general que deba ser aplicada al resto del frontend.

## Criterios de aceptación

- Una URL `/images/{id}` puede mostrarse correctamente en un `<img>`.
- La request al backend incluye el Bearer Token mediante el API Client existente.
- La imagen se obtiene como Blob.
- Se genera correctamente una Object URL.
- La Object URL se libera cuando deja de utilizarse.
- Una URL HTTPS externa se muestra directamente sin pasar por el API Client.
- `null` no genera ninguna request.
- No existen llamadas `fetch` directas para resolver imágenes.
- No se almacenan tokens ni imágenes en almacenamiento persistente.
- La solución es reutilizable por cualquier componente del frontend.
- TypeScript compila correctamente con `npm run typecheck`.

## NOTAS
Si hay una mejor forma de implementar, si hay necesidades de cambio en el backend para simplificar el manejo en el front, o cualquier cuestión que ayude a resolver este problema de la mejor manera posible, por favor, generar una task nueva en planned, dirigida al humano, con las opciones o necesidades para su evaluación y mover esta a bloqueada.
Si no se requiere nada, y la opción planteada es la correcta, aplicar los cambios y mover a finished.

---
Result:
Completed.

Completed work:
- Added `fetchApiBlob` to `infrastructure/api/client/api-client.ts` to retrieve binary data through the centralized API client with authentication and refresh token handling.
- Created `hooks/use-protected-image.ts` with a reusable hook that resolves protected image URLs (`/images/{id}`) as Blob URLs, passes external HTTP/HTTPS URLs directly, and handles `null`/`undefined` without requests.
- Created `components/protected-image.tsx`, a reusable component for displaying protected images using the hook.
- Updated `UserMenu` to use `useProtectedImage` internally, so avatars from `/images/{id}` are resolved correctly in the navbar.
- Updated `profile-page.tsx` to use `useProtectedImage` for the avatar preview/upload area.
- Updated `index-page.tsx` to pass the raw `avatarUrl` from `useAuth` to `UserMenu` instead of resolving it manually.
- Verified that Object URLs are released via `URL.revokeObjectURL()` when the component unmounts or the URL changes.
- Verified that no direct `fetch` calls exist for images outside the API client.
- Verified that no tokens or images are stored in `localStorage` or other persistent storage.
- Verified that external images (Google avatars) are shown directly without API client overhead.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- Protected images (`/images/{id}`) are fetched with the Bearer Token via the API client and rendered as Blob URLs.
- External images are rendered directly.
- `null` avatars show the fallback initial without making requests.

Notes:
- `components.md` was updated to document the new `ProtectedImage` component.