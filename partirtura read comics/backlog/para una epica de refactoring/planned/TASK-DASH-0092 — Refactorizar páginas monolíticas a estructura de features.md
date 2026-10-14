# TASK-DASH-0092 — Refactorizar páginas monolíticas a estructura de features

## Objetivo

Refactorizar las páginas del Dashboard que están como archivos monolíticos en `pages/` (o `features/<name>/pages/` con página única) para extraer componentes reutilizables y seguir el patrón `features/<name>/components/`.

## Contexto

Las siguientes páginas son archivos monolíticos que violan las reglas de "Single responsibility" y "No HTML monolítico dentro de la Page":

| Página | Líneas | Feature destino |
|--------|--------|-----------------|
| `pages/countries-page.tsx` | 530 | `features/countries/` |
| `pages/franchises-page.tsx` | 492 | `features/franchises/` |
| `pages/works-page.tsx` | 561 | `features/works/` |
| `pages/series-page.tsx` | 525 | `features/series/` |
| `pages/bans-page.tsx` | 443 | `features/bans/` |
| `pages/bans-select-user-page.tsx` | 297 | `features/bans/` |
| `pages/users-page.tsx` | 344 | `features/users/` |
| `pages/admins-page.tsx` | 378 | `features/admins/` |
| `pages/publisher-form-page.tsx` | 614 | `features/publishers/` |
| `pages/franchise-form-page.tsx` | 616 | `features/franchises/` |
| `pages/franchise-select-publisher-page.tsx` | 297 | `features/franchises/` |
| `pages/series-form-page.tsx` | 567 | `features/series/` |
| `pages/series-select-franchise-page.tsx` | 111 | `features/series/` |
| `pages/number-form-page.tsx` | 1624 | `features/numbers/` |
| `pages/numbers-page.tsx` | 667 | `features/numbers/` |
| `pages/graphic-novel-form-page.tsx` | 1410 | `features/graphic-novels/` |
| `pages/graphic-novels-page.tsx` | 597 | `features/graphic-novels/` |
| `pages/settings-page.tsx` | 538 | `features/settings/` |
| `pages/ban-form-page.tsx` | 467 | `features/bans/` |
| `pages/admin-form-page.tsx` | 543 | `features/admins/` |
| `features/people/pages/persons-page.tsx` | 567 | `features/people/` (monolítica) |

## Leer antes de implementar

- `project/frontend-coding-rules.md` — Feature architecture, single responsibility.
- `project/dashboard-architecture.md` — Feature-based architecture.
- `project/components.md` — Component index.
- Referencias de pages que ya siguen el patrón: `features/roles/pages/roles-page.tsx` (13 componentes extraídos).

## Implementar

Este es un **epic task** que abarca múltiples páginas. Se recomienda descomponer por feature o priorizar por:

1. **Pages simples** (listings con tabla simple): countries, works, series, bans, users, admins
2. **Pages de selección**: franchise-select-publisher, series-select-franchise, bans-select-user
3. **Pages de formulario**: publisher-form, franchise-form, series-form, number-form, graphic-novel-form, ban-form, admin-form
4. **Persons page**: ya en `features/people/` pero monolítica.

Estrategia de refactorización para cada page:
1. Crear/mover a `features/<name>/pages/<name>-page.tsx`
2. Extraer componentes a `features/<name>/components/`
3. Extraer servicios a `features/<name>/services/` si no existen
4. Extraer tipos a `features/<name>/types/` si no existen
5. Actualizar imports en `routes.tsx`

## Restricciones

- No cambiar funcionalidad ni estilos visuales.
- Mantener el mismo comportamiento.
- TypeScript + Vite build deben seguir funcionando.
- Se debe priorizar la calidad del refactor sobre la velocidad.

## Prioridad recomendada (por complejidad creciente)

1. `admins-page.tsx` (378 lines) — tabla simple
2. `users-page.tsx` (344 lines) — tabla simple
3. `bans-page.tsx` (443 lines) — tabla con estado
4. `countries-page.tsx` (530 lines) — tabla + select
5. `franchises-page.tsx` (492 lines) — tabla + acciones contextuales
6. `series-page.tsx` (525 lines) — tabla + filtros
7. `works-page.tsx` (561 lines) — tabla + múltiples acciones
8. `persons-page.tsx` (567 lines) — ya en features pero monolítica
9. `settings-page.tsx` (538 lines) — formulario de seguridad
10. `ban-form-page.tsx` (467 lines) — formulario
11. `admin-form-page.tsx` (543 lines) — formulario con upload
12. `franchise-select-publisher-page.tsx` (297 lines) — página de selección
13. `series-select-franchise-page.tsx` (111 lines) — página de selección
14. `bans-select-user-page.tsx` (297 lines) — página de selección
15. `series-form-page.tsx` (567 lines) — formulario
16. `publisher-form-page.tsx` (614 lines) — formulario + upload
17. `franchise-form-page.tsx` (616 lines) — formulario + upload
18. `numbers-page.tsx` (667 lines) — tabla con múltiples filtros
19. `graphic-novels-page.tsx` (597 lines) — página de shell contextual
20. `number-form-page.tsx` (1624 lines) — formulario complejo
21. `graphic-novel-form-page.tsx` (1410 lines) — formulario complejo

## Validación

- TypeScript compila sin errores.
- Vite build exitoso.
- Todas las páginas mantienen el mismo comportamiento funcional y visual.
