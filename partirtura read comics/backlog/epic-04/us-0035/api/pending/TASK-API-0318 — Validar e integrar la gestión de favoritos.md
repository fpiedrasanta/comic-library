# TASK-API-0318 — Validar e integrar la gestión de favoritos

## Objetivo

Verificar la implementación completa de US-0035 en Backend/API e integrar los cambios en `main` únicamente si todas las validaciones resultan satisfactorias.

## Contexto obligatorio

Leer:

- `communication.md`
- `endpoints.md`
- La US-0035.
- TASK-API-0313.
- TASK-API-0314.
- TASK-API-0315.
- TASK-API-0316.
- TASK-API-0317.
- Las reglas de arquitectura, dominio, servicios, repositorios y pruebas del Backend/API.

## Validaciones funcionales

Comprobar:

1. Agregar un Work a favoritos.
2. Quitar un favorito mediante eliminación física.
3. Rechazar o resolver correctamente intentos de duplicación.
4. Aislamiento de favoritos entre usuarios.
5. `GET /api/works` con `isFavorite=true`.
6. `GET /api/works` con `false`, `null` y valores distintos de `true`.
7. Estado `isFavorite` en cada elemento del catálogo.
8. Estado `isFavorite` en historial y recomendaciones, exclusivamente en las respuestas.
9. Conteos y paginación correctos al filtrar favoritos.
10. Integridad del progreso, historial, valoraciones y listas.
11. Migración de base de datos y restricciones de unicidad.
12. Rendimiento de las consultas y ausencia de consultas individuales innecesarias por Work.

## Revisión técnica

- Revisar la separación entre endpoints, servicios, repositorios y dominio.
- Confirmar que la entidad `Favorite` no incorpora `UserId` ni `WorkId` como propiedades de dominio.
- Confirmar que se utiliza el usuario autenticado.
- Revisar manejo de errores, transacciones y consistencia de datos.
- Ejecutar todas las pruebas y validaciones disponibles.
- Revisar `git diff` y verificar que no haya cambios ajenos a la US.

## Integración final en main

**Realizar estos pasos únicamente cuando todas las validaciones sean satisfactorias y no existan bloqueos pendientes.**

1. Confirmar que todos los cambios de la US-0035 estén committeados y publicados en `feature/us-0035`.
2. Cambiar a `main` y actualizarla desde el remoto.
3. Integrar `feature/us-0035` en `main`.
4. Resolver cualquier conflicto, si existiera, y repetir las validaciones afectadas.
5. Confirmar que el resultado integrado en `main` compila y que las pruebas pasan.
6. Publicar `main` en el remoto.
7. Eliminar la rama de la US local y remota únicamente después de verificar que la integración fue exitosa y que no se perderán cambios.
8. Registrar los commits integrados, las validaciones ejecutadas y el resultado de la integración en esta misma task mediante **append**, sin sobrescribir el contenido previo.

Si las validaciones fallan, la integración no debe realizarse. Documentar los hallazgos y el trabajo pendiente y mover la task a `blocked` según `communication.md`.

## Criterios de aceptación

- Los seis endpoints/operaciones involucrados cumplen la US-0035.
- Las consultas devuelven el estado correcto de favorito.
- La persistencia y la migración son válidas.
- No se rompen los contratos existentes ni las funcionalidades relacionadas.
- Todas las validaciones pasan.
- La integración en `main` está verificada.

## Resultado de ejecución

Registrar ramas, commits, migraciones, validaciones, incidencias e integración final.
