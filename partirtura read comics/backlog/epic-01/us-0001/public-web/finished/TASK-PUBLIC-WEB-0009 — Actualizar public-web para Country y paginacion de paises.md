Task ID: TASK-PUBLIC-WEB-0009
Title: Actualizar public-web para Country y paginacion de paises
Description: Adaptar public-web al renombramiento de la entidad Nationality por Country en el backend. Actualizar tipos TypeScript, el API Client, el repository de paises y el componente de registro para que consuma la lista de paises de forma paginada mediante ListResponse<CountryDto>. La lista de paises debe pedirse al endpoint con parametros de paginacion y el componente debe consumir el objeto paginado completo.
Expected result: El componente de registro carga paises paginados desde el backend usando el nuevo API Client y repository. Los tipos reflejan Country en lugar de Nationality.
Relevant context: frontend-coding-rules.md, architecture-public-web.md, technology-frontend-public-web.md, TASK-PUBLIC-WEB-0007, TASK-PUBLIC-WEB-0008, TASK-API-0015
Dependencies: TASK-PUBLIC-WEB-0007, TASK-PUBLIC-WEB-0008, TASK-API-0015
Acceptance criteria:
- No existen referencias a Nationality como entidad en el codigo de public-web; se utiliza Country.
- El tipo CountryDto refleja la estructura devuelta por el backend (id, code, name, isActive).
- Existe el tipo ListResponse<T> en public-web/types/api.ts.
- El API Client implementa fetchApi<T> que retorna json.payload.
- El repository de paises expone un metodo getPaged que devuelve Promise<ListResponse<CountryDto>>.
- El componente register-page.tsx consume el repository de paises, no llama a apiClient directamente.
- El componente carga la lista de paises con paginacion (pageSize=12, currentPage=1 por defecto).
- El select de paises consume result.items.
- Los metadatos de paginacion (currentPage, totalPages, hasNextPage, etc.) estan disponibles en el componente para futura navegacion entre paginas si fuera necesario.
- No se hardcodean endpoints en componentes.
- No se hardcodea la URL base de la API.

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

Adaptado el frontend al renombramiento de `Nationality` a `Country` y a la paginación de países.

#### 1. `types/api.ts` — Actualizado (implementado en TASK-PUBLIC-WEB-0007)

- Agregado `ListResponse<T>` con metadatos de paginación (currentPage, totalPages, hasNextPage, hasPriorPage, totalCount, pageSize, nextPage, priorPage, items).
- Agregado `CountryDto` interface (id, code, name, isActive).
- Agregados tipos de payload: `ValidateEmailPayload`, `ResendValidationPayload`, `RegisterPayload`.

#### 2. `country-repository.ts` — Actualizado

- Renombrado método `getPage` → `getPaged` (conforme a criterio de aceptación).
- `getPaged(request: GetCountriesRequest): Promise<ListResponse<CountryDto>>` expone método tipado que retorna el objeto paginado completo.

#### 3. `register-page.tsx` — Actualizado

- Removida interfaz local `Nationality`. Usa `CountryDto` importado desde `@/types/api`.
- Estado: `ListResponse<CountryDto> | null` (almacena el objeto paginado completo, no solo items).
- Variable `nationalities` → `countries`, `isLoadingNationalities` → `isLoadingCountries`, `loadNationalities` → `loadCountries`.
- Carga de países: `countryRepository.getPaged({ currentPage: 1, pageSize: 12 })` → `setCountries(result)`.
- Select consume `countries?.items.map((country) => ...)`.
- Label cambiado de "Nacionalidad" a "País".
- Loading/pagination metadata disponible vía `countries` (para futura navegación entre páginas).
- Campo `nationalityId` preservado en zod schema y FormData (el backend mantiene este nombre en el contrato de API según TASK-API-0015).

#### 4. Verificación de criterios de aceptación

- [x] No existen referencias a `Nationality` como entidad en el código; se utiliza `Country` / `CountryDto`.
- [x] `CountryDto` refleja la estructura del backend (id, code, name, isActive).
- [x] Existe `ListResponse<T>` en `public-web/types/api.ts`.
- [x] `fetchApi<T>` implementado en TASK-0007, retorna `json.payload`.
- [x] El repository de países expone `getPaged()` → `Promise<ListResponse<CountryDto>>`.
- [x] `register-page.tsx` consume el repository, no llama a `apiClient`/`fetchApi` directamente.
- [x] Carga con paginación (pageSize=12, currentPage=1 por defecto).
- [x] El select consume `result.items`.
- [x] Metadatos de paginación disponibles en el componente (vía estado `countries: ListResponse<CountryDto> | null`).
- [x] No se hardcodean endpoints en componentes (encapsulados en repositories).
- [x] No se hardcodea la URL base de la API (viene de `VITE_API_URL` en `api-client.ts`).

#### 5. Documentation

- `components.md`: sin cambios (no se agregaron componentes UI reutilizables; los repositories no son componentes UI).
- `pages.md`: sin cambios (no cambió la estructura de páginas).

#### 6. Verificación técnica

- `npx tsc --noEmit`: ✓ Pasa sin errores
- `npm run build`: ✓ Build exitoso (120 modules transformados)

#### 7. Cierre de dependencias

TASK-PUBLIC-WEB-0009 desbloquea potencialmente futuras tareas que requieran navegación de páginas de países.

### Responsable

Ejecutado por Frontend Public Web Agent.