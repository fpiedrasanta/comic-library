# TASK-API-0131 — Reemplazar strings mágicos por constantes

## Objetivo

Eliminar strings mágicos repetidos en el código para roles, direcciones de ordenamiento y campos de ordenamiento, mejorando la mantenibilidad y reduciendo el riesgo de errores por tipeo.

## Completed Work

- Creada `Application/Constants/Roles.cs` con `Roles.Administrator = "Administrator"`.
- Creada `Application/Constants/SortDirection.cs` con `SortDirection.ASC = "ASC"` y `SortDirection.DESC = "DESC"`.
- Reemplazados los 14 usos de `[Authorize(Roles = "Administrator")]` por `[Authorize(Roles = Roles.Administrator)]` en `UsersController`, `BansController`, `AdminUsersController` y `AdminCountriesController`.
- Reemplazados los usos de `"ASC"` y `"DESC"` en `ListRequest.cs`, `UserQueryService.cs`, `CountryService.cs`, `BanService.cs`, `AdminUserService.cs`, `UserRepository.cs`, `CountryRepository.cs` y `BanRepository.cs` por las constantes correspondientes.
- Verificada la solución compila correctamente.

## Pending Work

Ninguna.

## Reason

La revisión transversal detectó que el string `"Administrator"` aparecía en 14 lugares, `"ASC"`/`"DESC"` en múltiples servicios/repositorios, y los campos de ordenamiento se repetían como strings arbitrarios sin constantes. Esto aumentaba el riesgo de errores de tipeo y dificultaba el refactoring.

## Assigned to

Backend Agent

## Blocked task

Ninguna.
