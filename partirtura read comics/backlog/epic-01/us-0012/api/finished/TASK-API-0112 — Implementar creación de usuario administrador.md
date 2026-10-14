# TASK-API-0112 — Implementar creación de usuario administrador

## Task ID

TASK-API-0112

## Title

Implementar creación de usuario administrador

## Description

Implementar el servicio necesario para crear un nuevo usuario con rol `Administrator`.

## Requirements

El backend debe:

- Validar los datos recibidos.
- Validar unicidad del email.
- Validar el país.
- Crear el usuario utilizando el mecanismo de identidad existente.
- Aplicar las reglas existentes de contraseña.
- Asignar el rol `Administrator` exclusivamente desde backend.
- Establecer `User.IsActive = true`.
- Persistir utilizando los mecanismos existentes.

## Security

El cliente no puede indicar el rol.

No debe ser posible crear un usuario administrativo mediante una manipulación del request para obtener otro rol.

## Acceptance Criteria

- [ ] Se puede crear un administrador.
- [ ] El nuevo usuario posee rol `Administrator`.
- [ ] El usuario queda activo.
- [ ] Se validan datos obligatorios.
- [ ] Se valida email duplicado.
- [ ] Se valida país.
- [ ] Se aplican reglas de contraseña.
- [ ] El rol no proviene del request.
- [ ] Los errores utilizan las excepciones existentes.
- [ ] No se almacena la contraseña en texto plano.

## Dependencies

TASK-API-0111

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Agregado método `CreateAdminUserAsync` en `IAdminUserService`.
- Implementado método en `AdminUserService` con validaciones de `FirstName`, `LastName`, `Email`, `Password` y `CountryId`.
- Valida que el país exista y esté activo mediante `ICountryRepository`.
- Valida unicidad de email mediante `IUserRepository.GetByEmailAsync`.
- Crea el usuario con `Role = UserRole.Administrator`, `IsEmailValidated = true`, `IsActive = true`.
- Hashea la contraseña mediante `IPasswordHasher`.
- Persiste mediante `IUserRepository.AddAsync` y `IUnitOfWork.SaveChangesAsync`.
- El rol no proviene del request.
- No se almacena la contraseña en texto plano.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0111

### Unblocks
TASK-API-0113

### Assigned to
Backend Agent