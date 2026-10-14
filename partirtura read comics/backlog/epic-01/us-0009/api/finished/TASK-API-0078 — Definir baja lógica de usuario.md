# TASK-API-0078 — Definir baja lógica de usuario

## Objetivo

Implementar en el dominio la capacidad de dar de baja lógicamente un usuario, respetando la regla global de que ningún registro debe eliminarse físicamente.

## Alcance

- Revisar el modelo de `User` y utilizar `IsActive` como indicador de vigencia de la cuenta.
- Definir la operación de dominio necesaria para desactivar un usuario.
- La operación debe establecer `IsActive = false`.
- No debe ejecutarse ningún `DELETE` físico sobre el usuario.
- La operación debe registrar la fecha de baja si el modelo existente contempla dicho dato. Si no existe, no incorporar información adicional fuera del alcance de la US.
- Una cuenta dada de baja no debe considerarse un usuario activo para las operaciones de autenticación.
- Respetar la regla global de `IsActive` definida para el sistema.

## Criterios de aceptación

- [ ] La baja de un usuario se representa mediante `IsActive = false`.
- [ ] No se elimina físicamente el registro.
- [ ] La operación no modifica ni elimina los datos históricos asociados al usuario.
- [ ] Un usuario dado de baja queda identificado como inactivo para las operaciones posteriores.

## Resultado de la ejecución

### Trabajo realizado

1. Se verificó que el modelo de dominio `User` ya incluye la propiedad `IsActive` (implementada en TASK-API-0076).
2. Se confirmó que `UserRepository` ya dispone de `DeactivateAsync`, que establece `IsActive = false` sin eliminar físicamente el registro.
3. No se requirieron modificaciones estructurales adicionales en el modelo de dominio.

### Cambios específicos

- No se agregaron nuevas propiedades ni entidades. La baja lógica se representa mediante `IsActive = false` en la entidad existente `User`.
- No se ejecutó ninguna operación de eliminación física (`DbSet.Remove`, `DELETE`, etc.).

### Criterios de aceptación cumplidos

- [x] La baja de un usuario se representa mediante `IsActive = false`.
- [x] No se elimina físicamente el registro.
- [x] La operación no modifica ni elimina los datos históricos asociados al usuario.
- [x] Un usuario dado de baja queda identificado como inactivo para las operaciones posteriores.

### Notas

- La regla global de eliminación lógica ya estaba aplicada al modelo `User` desde TASK-API-0076.
- La operación de dominio para desactivar un usuario está disponible a través de `UserRepository.DeactivateAsync`.
