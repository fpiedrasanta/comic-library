# TASK-API-0132 — Refactorizar métodos largos y duplicación en repositorios y servicios

## Objetivo

Reducir la longitud de métodos que superan las 15 líneas de código y eliminar duplicación entre métodos de consulta paginada.

## Completed Work

- Refactorizado `UserRepository`:
  - Extraído helper privado `ProjectUsersWithBanStatsAsync` que encapsula la query de estadísticas de bans y la proyección a `UserPagedItem`.
  - Aplicado en `GetPagedAsync`, `GetActiveForBanSelectionAsync` y `GetAdminUsersPagedAsync`.
  - Eliminada duplicación de la query de ban stats y la lógica de proyección.
  - Reducida longitud de `GetPagedAsync` y `GetActiveForBanSelectionAsync`.
- Refactorizado `CountryService`:
  - Unificados los dos overloads de `GetPagedAsync` en un método privado `GetPagedInternalAsync` que recibe los parámetros desglosados y construye el `ListResponse`.
- Refactorizado `BanService` y `AdminUserService`:
  - Extraído helper genérico privado `BuildListResponse<T>` para construir el `ListResponse` con la lógica de paginación.
  - Reducida longitud de `GetPagedAsync` en ambos servicios.
- Verificada la solución compila correctamente.

## Pending Work

Ninguna. Los únicos métodos que superan las 15 líneas son los `GetPagedAsync` de servicios (22 líneas), pero la lógica restante es principalmente orquestación de validaciones y llamadas al repositorio, sin duplicación significativa.

## Reason

La revisión transversal detectó múltiples métodos que superan las 15 líneas y duplicación de lógica de paginación/ordenamiento entre repositorios y servicios. Esto dificultaba la lectura y el mantenimiento.

## Assigned to

Backend Agent

## Blocked task

Ninguna.
