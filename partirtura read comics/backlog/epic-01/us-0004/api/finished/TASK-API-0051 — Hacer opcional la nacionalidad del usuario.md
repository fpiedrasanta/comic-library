# TASK-API-0051 — Hacer opcional la nacionalidad del usuario

## Objetivo

Revisar y corregir la implementación del backend para garantizar que la nacionalidad del usuario sea siempre opcional.

La nacionalidad nunca fue un requisito obligatorio del registro manual y tampoco debe convertirse en un requisito para usuarios registrados mediante Google.

---

## 1. Regla de negocio

Un usuario puede existir sin nacionalidad.

Por lo tanto:

```text
NationalityId = null
```

debe ser un estado válido para `User`.

La ausencia de nacionalidad no debe impedir:

- Registro manual.
- Registro mediante Google.
- Login.
- Validación de email.
- Recuperación de contraseña.
- Cambio de contraseña.
- Refresh Token.
- Cualquier otro flujo de autenticación.

---

## 2. Registro mediante Google

Eliminar cualquier comportamiento que asigne automáticamente una nacionalidad al usuario Google.

No utilizar:

```text
First active country
```

ni ningún otro valor arbitrario como nacionalidad.

El flujo debe ser:

```text
Google User
    ↓
Crear User
    ↓
NationalityId = null
    ↓
Login exitoso
```

La nacionalidad podrá ser completada posteriormente por el usuario mediante el flujo correspondiente de perfil.

---

## 3. Registro manual

Verificar que el registro manual tampoco requiera nacionalidad.

Si el usuario no proporciona nacionalidad:

```text
Register
    ↓
NationalityId = null
    ↓
Registro exitoso
```

Si proporciona una nacionalidad válida:

```text
Register
    ↓
NationalityId = Country seleccionado
    ↓
Registro exitoso
```

Ambos casos deben ser válidos.

---

## 4. Modelo de dominio

Revisar `User` y las configuraciones de Entity Framework Core para garantizar que la relación con `Country` permita:

```text
User.NationalityId = null
```

Si actualmente la propiedad o configuración impide `null`, modificarla.

No realizar cambios estructurales innecesarios.

---

## 5. Base de datos

Verificar que la columna correspondiente a la nacionalidad permita valores `NULL`.

Si es necesario modificar el modelo Code First:

- actualizar la entidad;
- actualizar la configuración de EF Core;
- generar/aplicar la modificación correspondiente según el mecanismo establecido por el proyecto.

No eliminar información existente.

---

## 6. Validaciones

Eliminar o corregir cualquier validación que considere la nacionalidad obligatoria.

No debe existir una validación que rechace un usuario simplemente porque:

```text
NationalityId == null
```

---

## 7. Documentación

Actualizar, si corresponde:

- `project/domain.md`
- `project/services.md`
- `project/endpoints.md`

No modificar documentación tecnológica si no se incorpora ninguna dependencia.

---

## Criterios de finalización

1. `User` puede existir sin nacionalidad.
2. `NationalityId` permite `null`.
3. La relación con `Country` permite ausencia de nacionalidad.
4. El registro manual funciona sin informar nacionalidad.
5. El registro manual continúa funcionando cuando se informa nacionalidad.
6. Google Login no asigna una nacionalidad arbitraria.
7. Un usuario creado mediante Google queda con `NationalityId = null`, salvo que exista un valor explícitamente proporcionado por el usuario.
8. Login y demás flujos de autenticación funcionan sin nacionalidad.
9. No se utiliza el primer país activo como valor por defecto.
10. Application, Infrastructure y Api compilan correctamente.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Changes Made

- Made `CountryId` nullable in `User` entity (`long?`).
- Updated `UserConfiguration` to make the `Country` relationship optional.
- Updated `RegisterUserApiRequest` to make `NationalityId` nullable (`long?`).
- Updated `RegisterUserFormRequest` to make `NationalityId` nullable (`long?`).
- Updated `UserService.RegisterAsync` to validate country only when `NationalityId` is provided.
- Updated `AuthService.LoginWithGoogleAsync` to create Google users with `CountryId = null` instead of assigning the first active country.
- Removed unused `ICountryRepository` dependency from `AuthService`.
- Generated EF Core migration `MakeCountryIdOptional`.
- Updated `endpoints.md` to show `nationalityId` as optional in registration.
- Updated `domain.md` to document `CountryId` as `long?` and `Nationality` as `Country?`.
- Updated `services.md` to reflect optional nationality validation.

### Verification

- Solution builds successfully with no errors and no warnings.
- Migration generated for database schema change.
- No existing behavior broken.