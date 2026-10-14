Task ID: TASK-PUBLIC-WEB-0007
Title: Crear API Client centralizado con fetch genérico
Description: Implementar una funcion fetch centralizada que inyecte headers (Authorization, Content-Type), resuelva la URL base desde variables de entorno, ejecute la llamada HTTP y normalice la respuesta. La funcion debe retornar jsonResult.payload en exito y propagar errores normalizados en fallo. Debe permitir que cualquier feature consuma el backend sin duplicar logica de HTTP.
Expected result: Existe una unica funcion fetch que todos los features utilizan para comunicarse con la API. Los headers se inyectan automaticamente. Los errores se manejan de forma centralizada.
Relevant context: frontend-coding-rules.md, architecture-public-web.md, technology-frontend-public-web.md
Dependencies: TASK-PUBLIC-WEB-0006
Acceptance criteria:
- La funcion fetchApi<T> acepta endpoint, metodo, body opcional y retorna Promise<T>.
- Inyecta Authorization Bearer desde token almacenado.
- Inyecta Content-Type application/json.
- Parsea la respuesta y retorna payload en exito.
- Propaga error normalizado en fallo con message y code.
- No hay llamadas fetch directas desde componentes.
- El tipo T corresponde al contenido de payload, no al wrapper ApiResponse.

al finalizar, (SOLO EN CASO DE SER NECESARIO) actualizar:
project/
  ├── public-web-architecture.md
  ├── frontend-public-web-stack-technology.md
  ├── frontend-coding-rules.md
  ├── pages.md
  └── components.md

Agregar a esta misma tarea los resultados de la ejecución.

en caso de bloqueo generar la task correspondiente al proyecto en /planned y mover esta a blocked.
en caso de finalizar mover la task a finalizado.

---

## Execution Results

### Trabajo realizado

Implementada una función `fetchApi<T>` centralizada que reemplaza a la anterior `apiClient`.

#### 1. `types/api.ts` — Actualizado

- Agregado `ListResponse<T>` interface con los campos de paginación (currentPage, hasNextPage, hasPriorPage, totalPages, pageSize, nextPage, priorPage, totalCount, items).
- Agregado `CountryDto` interface (id, code, name, isActive).
- Agregados tipos de payload: `ValidateEmailPayload`, `ResendValidationPayload`, `RegisterPayload` (representan el contenido de `payload` sin el wrapper `ApiResponse`).
- Actualizada `ApiError` para incluir `code` y `payload`.
- `RequestError` ahora es alias de `ApiError`.
- Removidos tipos wrapper obsoletos: `ValidateEmailResponse`, `ResendValidationResponse`, `RegisterResponse`, `PaginatedResponse`.

#### 2. `api-client.ts` — Reescrito con `fetchApi<T>`

- Renombrada `apiClient` → `fetchApi`.
- Importa `getAccessToken` desde `@/infrastructure/auth/token-storage` e inyecta `Authorization: Bearer` en todos los requests.
- Inyecta `Content-Type: application/json` solo para bodies que no sean FormData (para soportar multipart uploads como el avatar).
- Parsea la respuesta JSON y verifica `json.success`.
- En éxito: retorna `json.payload as T` (el tipo T corresponde al contenido de payload, no al wrapper ApiResponse).
- En fallo: lanza `ApiError` normalizado con `status`, `code`, `message` y `payload` (errors/detail).
- Exporta `API_BASE_URL` desde variable de entorno `VITE_API_URL`.

#### 3. `auth-service.ts` — Actualizado

- Cambiado import de `apiClient` → `fetchApi`.
- `validateEmail` retorna `Promise<ValidateEmailPayload>` (payload directo, no wrapper).
- `resendValidationEmail` retorna `Promise<ResendValidationPayload>` (payload directo).

#### 4. `register-page.tsx` — Actualizado

- Cambiado import de `apiClient` → `fetchApi`.
- Carga de nacionalidades: `fetchApi<CountryDto[]>('/nationalities')`.
- Submit: `fetchApi<RegisterPayload>('/users/register', ...)` — accede a `result.expiresInMinutes` directamente (no `response.payload.expiresInMinutes`).
- Manejo de errores: usa `RequestError` tipado desde `@/types/api`.
- Removida interfaz local `Nationality`, usa `CountryDto` importado.
- Endpoint `/nationalities` preservado (el rename a `/countries` es responsabilidad de TASK-0009).

#### 5. `verify-email-page.tsx` — Actualizado

- `validateEmail` retorna payload directo: `payload.token` en lugar de `response.payload.token`.
- `resendValidationEmail` retorna payload directo: `payload.expiresInMinutes` en lugar de `response.payload.expiresInMinutes`.
- El chequeo `response.success` fue removido (fetchApi ya lanza error en caso de fallo).
- El manejo de errores (`RequestError`) se mantiene funcionando.

#### 6. Documentación

- `components.md`: sin cambios (no se agregaron componentes UI reutilizables).
- `pages.md`: sin cambios (no cambió la estructura de páginas).

#### 7. Verificación

- `npx tsc --noEmit`: ✓ Pasa sin errores
- `npm run build`: ✓ Build exitoso (118 modules transformados)

### Criterios de aceptación cumplidos

- [x] `fetchApi<T>` acepta endpoint, método, body opcional y retorna `Promise<T>`.
- [x] Inyecta `Authorization: Bearer` desde token almacenado.
- [x] Inyecta `Content-Type: application/json` (excepto FormData).
- [x] Parsea la respuesta y retorna `payload` en éxito.
- [x] Propaga error normalizado en fallo con `message` y `code`.
- [x] No hay llamadas `fetch` directas desde componentes.
- [x] El tipo `T` corresponde al contenido de `payload`, no al wrapper `ApiResponse`.

### Responsable

Ejecutado por Frontend Public Web Agent.