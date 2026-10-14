# TASK-API-0126 — Validar seguridad, integridad y reglas de dominio de Country

## Objetivo

Realizar una revisión integral de la implementación de Country antes de considerarla finalizada.

## Completed Work

Pendiente.

## Pending Work

Verificar:

- `Country.IsActive` representa exclusivamente la activación lógica del país.
- No existe eliminación física de países.
- Un país desactivado conserva sus registros y relaciones existentes.
- Un usuario que ya tiene asociado un país desactivado conserva correctamente su referencia.
- Un país inactivo no puede ser seleccionado durante el registro de nuevos usuarios.
- La creación de usuarios valida que el país seleccionado exista y esté activo.
- La edición de usuarios mantiene correctamente las reglas de país activo.
- Los endpoints administrativos requieren rol `Administrator`.
- No es posible modificar `IsActive` mediante los DTOs de creación o edición.
- No es posible modificar el identificador mediante los DTOs.
- No existen formas de escalar privilegios mediante estos endpoints.
- Los códigos y nombres cumplen las reglas de unicidad definidas.
- No existen consultas N+1.
- Las consultas de lectura utilizan `AsNoTracking()` cuando corresponde.
- La implementación mantiene el contrato estándar `ApiResponse`.
- `project/endpoints.md` coincide con la implementación.
- La solución compila correctamente.

## Unblocked by

TASK-API-0125

## Unblocks

Ninguna.

## Execution Result

### Status
Finished

### Completed Work
- `Country.IsActive` represents exclusively the logical activation state of the country.
- No physical deletion of countries exists.
- A deactivated country preserves its records and existing relationships.
- A user with an associated deactivated country retains the reference correctly.
- An inactive country cannot be selected during new user registration (validated by `UserService` and `AuthService`).
- User creation validates that the selected country exists and is active.
- User profile update maintains correct active-country rules.
- All administrative endpoints require `Administrator` role.
- `IsActive` cannot be modified through create or update DTOs.
- The country identifier cannot be modified through DTOs.
- No privilege escalation paths exist through these endpoints.
- `Code` and `Name` uniqueness is enforced at both the application and database levels.
- No N+1 queries exist.
- Read queries use `AsNoTracking()`.
- Implementation uses the standard `ApiResponse` contract.
- `project/endpoints.md` matches the implementation.
- The solution compiles correctly without errors or warnings.
- A new migration `AddUniqueIndexToCountryName` was created to enforce `Name` uniqueness at the database level.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
