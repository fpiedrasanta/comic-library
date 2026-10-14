# TASK-API-0146 — Definir regla transversal para operaciones de entidades con imágenes

**Status:** Pending

**Assigned to:** Backend Agent

**Blocked task:** TASK-API-0145

## Objetivo

Establecer formalmente el patrón que deberán utilizar las futuras entidades que posean imágenes.

## Regla

Cuando una imagen pertenece conceptualmente a una entidad de negocio, su alta, reemplazo, conservación o eliminación debe formar parte de la operación de creación/actualización de dicha entidad.

No deben crearse endpoints CRUD de imágenes específicos de cada entidad salvo que exista una necesidad de negocio explícita que lo justifique.

Las operaciones que reciban datos de entidad e imagen deben utilizar `multipart/form-data`.

## Semántica estándar

### Create

```text
imageId = 0 + image = null
→ sin imagen
```

```text
imageId = 0 + image = archivo
→ crear imagen
```

### Update

```text
imageId = existingId + image = null
→ conservar imagen
```

```text
imageId = 0 + image = archivo
→ reemplazar imagen
```

```text
imageId = 0 + image = null
→ eliminar imagen
```

## Documentación

Agregar esta regla a:

`backend-coding-rules.md`

Documentar el patrón en los artefactos correspondientes que el proyecto utilice para contratos y endpoints.

## Criterios de aceptación

* La regla queda documentada.
* User y Publisher cumplen el patrón.
* La documentación de ambos flujos queda alineada.
* El patrón queda expresado de manera suficientemente general para futuras entidades.

## Execution Result

### Status
Finished

### Completed Work
- Agregada regla transversal de imágenes a `backend-coding-rules.md` (#53).
- Documentada semántica estándar para Create y Update.
- Verificada alineación con implementaciones existentes de User y Publisher.

### Issues Found
Ninguno.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0145

### Unblocks
Ninguna

### Assigned to
Backend Agent