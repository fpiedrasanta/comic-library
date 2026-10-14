Task ID: TASK-PUBLIC-WEB-0008
Title: Crear repositories por feature para encapsular llamadas al backend
Description: Reemplazar el acceso directo al API Client desde componentes y hooks por repositories especificos por feature. Cada repository agrupa las operaciones de un dominio (ej: comics, series, franchises, reading). Los repositories consumen el API Client centralizado y exponen metodos tipados que devuelven DTOs simples o ListResponse<TDto>. El objetivo es encapsular la ultima milla: los componentes no conocen endpoints, parametros ni estructuras HTTP.
Expected result: Cada feature tiene su repository. Los componentes consumen el repository, no el API Client.
Relevant context: frontend-coding-rules.md, architecture-public-web.md, technology-frontend-public-web.md
Dependencies: TASK-PUBLIC-WEB-0007
Acceptance criteria:
- Existe una carpeta repositories/ por feature o centralizada.
- Cada repository agrupa metodos de un dominio.
- Los metodos aceptan parametros tipados y retornan DTOs tipados.
- Para listados, retornan ListResponse<TDto>.
- No hay fetch directo en componentes.
- Los componentes consumen repositories, no el API Client.

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

Implementados repositories por feature que encapsulan las llamadas al API Client, eliminando el acceso directo a `fetchApi` desde los componentes.

#### 1. `features/authentication/api/authentication-repository.ts` — Creado

Repository de autenticación que agrupa las operaciones del dominio auth:

- `register(formData: FormData): Promise<RegisterPayload>` — POST `/users/register` (multipart/form-data)
- `validateEmail(request: ValidateEmailRequest): Promise<ValidateEmailPayload>` — POST `/users/validate-email`
- `resendValidationEmail(request: ResendValidationRequest): Promise<ResendValidationPayload>` — POST `/users/resend-validation-email`

Exporta instancia singleton `authenticationRepository`.

#### 2. `features/authentication/api/country-repository.ts` — Creado

Repository de países que expone:

- `getPaged(request: GetCountriesRequest): Promise<ListResponse<CountryDto>>` — GET `/countries` con paginación (currentPage, pageSize, orderBy, orderDir)

Exporta instancia singleton `countryRepository` y tipo `GetCountriesRequest`.

#### 3. `features/authentication/api/index.ts` — Creado (barrel file)

Exporta los repositories y tipos para imports limpios.

#### 4. `register-page.tsx` — Actualizado

- Importa `countryRepository` y `authenticationRepository` desde `@/features/authentication/api`
- Carga de países: `countryRepository.getPaged({ currentPage: 1, pageSize: 12 })` → `result.items`
- Registro: `authenticationRepository.register(formData)` → `result.expiresInMinutes`
- Removido import de `fetchApi` directo
- Removido import de `RegisterPayload` (ya no necesario, el repository lo tipa)
- Mantenido el nombre `nationalityId` en el zod schema y form data (TASK-0009 lo renombrará)

#### 5. `verify-email-page.tsx` — Actualizado

- Importa `authenticationRepository` desde `@/features/authentication/api`
- `validateEmail()` → `authenticationRepository.validateEmail()`
- `resendValidationEmail()` → `authenticationRepository.resendValidationEmail()`
- Removido import de `@/infrastructure/auth/auth-service`

#### 6. `infrastructure/auth/auth-service.ts` — Eliminado

Las funciones `validateEmail` y `resendValidationEmail` fueron trasladadas al `AuthenticationRepository`. El archivo se convirtió en código muerto y fue removido según rule #63 (No se debe mantener código muerto).

#### 7. `infrastructure/auth/token-storage.ts` — Preservado

Sigue siendo utilizado por el API Client (`fetchApi`) para inyectar el token de autorización.

#### 8. Documentación

- `components.md`: sin cambios (no se agregaron componentes UI).
- `pages.md`: sin cambios (no cambió la estructura de páginas).

#### 9. Verificación

- `npx tsc --noEmit`: ✓ Pasa sin errores
- `npm run build`: ✓ Build exitoso (120 modules transformados)

### Criterios de aceptación cumplidos

- [x] Existe una carpeta `api/` por feature (`features/authentication/api/`).
- [x] Cada repository agrupa métodos de un dominio (authentication, country).
- [x] Los métodos aceptan parámetros tipados y retornan DTOs tipados.
- [x] Para listados, retornan `ListResponse<TDto>` (country-repository).
- [x] No hay `fetchApi` directo en componentes.
- [x] Los componentes consumen repositories, no el API Client.

### Responsable

Ejecutado por Frontend Public Web Agent.