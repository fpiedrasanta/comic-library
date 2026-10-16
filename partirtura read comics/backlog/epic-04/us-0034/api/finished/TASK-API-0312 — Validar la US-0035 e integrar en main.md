# TASK-API-0312 — Validar la US-0035 e integrar en main

## Objetivo

Realizar la revisión técnica final de la US-0035 — Lectura secuencial de listas de Works, comprobar que la implementación y la documentación estén completas y consistentes, ejecutar las validaciones finales e integrar los cambios en `main`.

Esta task no debe utilizarse para introducir funcionalidades nuevas. Si se detectan defectos, corregirlos antes de integrar y volver a ejecutar las validaciones afectadas.

## Contexto obligatorio

Leer y revisar:

- `project/backend-agent.md`
- `project/project.md`
- `backend-architecture.md`
- `backend-coding-rules.md`
- `backend-stack-technology.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `us-0035.md`
- `communication.md`
- `TASK-API-0307` a `TASK-API-0311`.
- Todos los cambios de código de la rama de la US-0035.

## Alcance

### 1. Revisión de arquitectura y código

Verificar que la implementación cumpla con:

- `backend-architecture.md`.
- `backend-coding-rules.md`.
- `backend-stack-technology.md`.
- Las convenciones de Clean Architecture y las responsabilidades de cada capa.
- Las convenciones existentes de repositorios, servicios, endpoints, errores, autenticación y persistencia.

Revisar el código completo de la US, no solamente el diff de la última task.

Comprobar especialmente que:

- El dominio existente se reutiliza sin duplicar entidades.
- Los repositorios no incorporan lógica de negocio que corresponde a los servicios.
- Los servicios no duplican las implementaciones existentes de progreso o valoración de Works.
- Los endpoints respetan los contratos y convenciones del proyecto.
- El progreso de páginas pertenece al usuario y al Work, independientemente de la lista.
- El Work actual de la lista y el progreso de páginas son responsabilidades diferenciadas.
- El orden de navegación dentro de la lista utiliza `WorkListItem.Position`.
- Las valoraciones de listas se crean y actualizan sin inconsistencias en sus agregados.
- No se introdujeron regresiones detectables en funcionalidades existentes.

### 2. Revisión de documentación

Verificar que los siguientes documentos estén actualizados y coincidan con el código:

- `domain.md`.
- `repositories.md`.
- `services.md`.
- `endpoints.md`.

El dominio ya está implementado. No modificarlo por rutina; documentar o corregir únicamente si se detecta una discrepancia real.

Revisar también los documentos específicos de repositorios, servicios y endpoints que correspondan.

Comprobar que las rutas, verbos HTTP, parámetros, respuestas, autenticación, validaciones y errores documentados coincidan con la implementación.

Si hay discrepancias, corregirlas antes de continuar.

### 3. Validación completa

- Compilar la solución Backend/API.
- Ejecutar todos los tests relevantes, incluidos los creados en `TASK-API-0311`.
- Ejecutar las demás validaciones automatizadas disponibles.
- Revisar `git diff` y el estado del repositorio.
- Confirmar que no queden cambios sin commit ni bloqueos pendientes.
- Registrar las validaciones ejecutadas y sus resultados reales.

## Criterios de aceptación

- La implementación cumple con los documentos de arquitectura, stack y reglas de código.
- El código de las cuatro operaciones está revisado.
- `domain.md`, `repositories.md`, `services.md` y `endpoints.md` están actualizados.
- Los tests y las validaciones disponibles pasan.
- No quedan cambios sin commit ni bloqueos pendientes.
- La rama de la US está publicada y lista para integrar.
- La integración en `main` compila y las pruebas pasan.
- La rama local y remota de la US se elimina únicamente después de confirmar una integración exitosa.

## Integración final en main

**Realizar estos pasos únicamente cuando todas las validaciones sean satisfactorias y no existan bloqueos pendientes.**

1. Confirmar que todos los cambios de la US-0035 estén committeados y publicados en `feature/us-0035-api-sequential-list-reading`.
2. Cambiar a `main` y actualizarla desde el remoto.
3. Integrar `feature/us-0035-api-sequential-list-reading` en `main`.
4. Resolver cualquier conflicto, si existiera, y repetir las validaciones afectadas.
5. Confirmar que el resultado integrado en `main` compila y que las pruebas pasan.
6. Publicar `main` en el remoto.
7. Eliminar la rama de la US local y remota únicamente después de verificar que la integración fue exitosa y que no se perderán cambios.
8. Registrar los commits integrados, las validaciones ejecutadas y el resultado de la integración en esta misma task mediante **append**, sin sobrescribir el contenido previo.

Si las validaciones fallan, la integración no debe realizarse. Documentar los hallazgos y el trabajo pendiente y mover la task a `blocked` según `communication.md`.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se validó**:
- Revisión de arquitectura/código: dominio reusado sin duplicar entidades; repositorios sin lógica de negocio; servicios no duplican progreso/rating de Works; endpoints respetan contratos; list-`currentWork` vs `WorkReadingProgress` (pages) diferenciados; orden de navegación por `WorkListItem.Position`; list ratings upsert consistente (accumulators + count no duplicado); `userId` de `sub`. No se detectaron regresiones.
- Revisión de documentación: `domain.md`, `repositories.md`, `services.md`, `endpoints.md` sincronizados con el código de 0307-0310 (rutas, verbos, parámetros, respuestas, auth, errores). El dominio no se modificó.
- Build de la solution Backend/API: **0 errores**.
- Tests: `dotnet test tests/Infrastructure.Tests/Infrastructure.Tests.csproj` → **389/389 pass** (incluye los tests de 0311).

**Integración final en `main`**:
1. Todos los cambios de US-0035 estaban committeados en `feature/us-0035-api-sequential-list-reading`.
2. `main` actualizado desde remoto.
3. Integración fast-forward (`4c334ca`) en `main`; conflicto: ninguno.
4. Post-integración: build 0 errores; 389/389 pass.
5. `main` publiqueado al remoto.
6. Branch `feature/us-0035-api-sequential-list-reading` **borrada** (verificada con `git ls-remote`/`git branch`: no existe ni local ni remote).

**Commits integrados**:
- `c79b824` (0307 currentWorkId en list-detail)
- `93f4904` (0308 reader context + tests)
- `77c8c73` (0309 PUT current-work + 0310 list rating)
- `4c334ca` (integración US-0035 a main)
- `19596f5` (tests seed-independent)
- `7fe0469`, `80950a5`, `80950a5+` (cierre docs 0307/0308 a finished)

**Notas**: no quedan cambios sin commit ni bloqueos; working tree limpio. Los 5 "failures preexistentes" en `main` (WorkCard 2/4, Recommended 3/12) reportados en el board no son reproducibles en el test sandbox (DB fresh con migraciones + seed limpio) — corresponden al dataset de dev `TASK-API-0299` y no a US-0035.