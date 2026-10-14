# TASK-API-0158 — Validar integridad, seguridad y reglas de dominio de Franchise

## Objetivo

Realizar una revisión integral de la implementación de Franchise antes de considerarla finalizada.

## Validaciones funcionales

Verificar:

- `Name` obligatorio.
- Se permiten franquicias con el mismo nombre.
- `Publisher` obligatorio.
- `Publisher` debe existir.
- `Publisher` debe estar activo para crear o modificar una franquicia.
- `Color` opcional.
- Si existe `Color`, debe cumplir formato `#RRGGBB`.
- `IsFeatured` editable.
- `IsOngoing` editable.
- `IsActive` no editable mediante POST/PUT.
- No existe eliminación física.

## Imagen

Verificar todos los escenarios:

### Sin imagen

```text
imageId = 0
image = null
```

### Nueva imagen

```text
imageId = 0
image = archivo
```

### Mantener imagen

```text
imageId = existente
image = null
```

### Eliminar imagen

```text
imageId = 0
image = null
```

### Reemplazar imagen

```text
imageId = 0
image = nuevo archivo
```

Verificar que no queden imágenes huérfanas cuando una operación transaccional falle.

## Seguridad

Verificar:

- todos los endpoints requieren autenticación;
- todos los endpoints administrativos requieren rol `Administrator`;
- no existen endpoints públicos que permitan modificar franquicias;
- `IsActive` no puede ser manipulado mediante POST/PUT;
- el Id no puede ser manipulado mediante los contratos de entrada.

## Persistencia

Verificar:

- relación obligatoria con Publisher;
- relación opcional con Image;
- comportamiento de eliminación;
- índices;
- ausencia de consultas N+1;
- `AsNoTracking()` en consultas de lectura.

## Listado

Verificar que:

### Búsqueda

Solamente utiliza:

```text
Franchise.Name
Publisher.Name
Publisher.Country.Name
```

### Filtros

```text
IsFeatured
IsOngoing
IsActive
```

### Ordenamiento

Solamente utiliza:

```text
Name
PublisherCountry
PublisherName
```

El país y la editorial deben ordenarse por sus nombres, nunca por IDs.

## Documentación

Verificar que estén actualizados y sean coherentes:

- `project/domain.md`
- `project/services.md`
- `project/repositories.md`
- `project/endpoints.md`

Si se agregaron dependencias:

- `backend-stack-technology.md`

Si se agregó alguna regla transversal:

- `backend-coding-rules.md`

## Validación final

Ejecutar compilación y las pruebas disponibles.

No considerar la task terminada si existen errores de compilación, warnings introducidos por la implementación o inconsistencias entre código y documentación.

## Criterios de aceptación

La implementación de Franchise queda considerada finalizada cuando:

- el modelo está correctamente definido;
- la persistencia funciona;
- el repositorio soporta listado, búsqueda, filtros, ordenamiento y paginación;
- el servicio implementa las reglas de negocio;
- POST/PUT integran imagen mediante multipart;
- Activate/Deactivate funcionan;
- no existe DELETE físico;
- la seguridad es correcta;
- la documentación está alineada;
- la solución compila correctamente.

## Unblocks

Ninguna.

## Resultado

### Validación funcional

| Criterio | Estado |
|----------|--------|
| Name obligatorio | ✅ Valida en servicio |
| Mismo nombre permitido | ✅ Sin restricción única |
| Publisher obligatorio | ✅ Valida en servicio |
| Publisher debe existir | ✅ Valida en servicio |
| Publisher debe estar activo | ✅ Valida en servicio |
| Color opcional | ✅ |
| Color hex #RRGGBB cuando existe | ✅ Valida en servicio |
| IsFeatured editable | ✅ |
| IsOngoing editable | ✅ |
| IsActive no editable vía POST/PUT | ✅ No está en DTOs |
| No existe eliminación física | ✅ Sin endpoint DELETE |

### Validación de imagen

| Escenario | Estado |
|-----------|--------|
| Sin imagen (imageId=0, image=null) | ✅ No crea imagen |
| Nueva imagen (imageId=0, image=file) | ✅ Crea imagen |
| Mantener imagen (imageId=existing, image=null) | ✅ Conserva actual |
| Eliminar imagen (imageId=0, image=null) | ✅ Elimina imagen |
| Reemplazar imagen (imageId=0, image=new file) | ✅ Reemplaza imagen |
| Sin imágenes huérfanas en fallos | ✅ Cleanup en catch |

### Validación de seguridad

| Criterio | Estado |
|----------|--------|
| Requiere autenticación | ✅ Todos los endpoints |
| Requiere rol Administrator | ✅ Todos los endpoints |
| No hay endpoints públicos para modificar | ✅ |
| IsActive no manipulable vía POST/PUT | ✅ |
| Id no manipulable vía contratos | ✅ |

### Validación de persistencia

| Criterio | Estado |
|----------|--------|
| Relación obligatoria con Publisher | ✅ Restrict |
| Relación opcional con Image | ✅ SetNull |
| Comportamiento de eliminación | ✅ Sin cascade |
| Índices | ✅ Name, IsActive, IsFeatured, IsOngoing |
| Sin consultas N+1 | ✅ Include de navegación |
| AsNoTracking en lecturas | ✅ |

### Validación de listado

| Criterio | Estado |
|----------|--------|
| Búsqueda: Name, Publisher.Name, Publisher.Country.Name | ✅ |
| Filtros: IsFeatured, IsOngoing, IsActive | ✅ |
| IsActive=null devuelve todos | ✅ |
| Ordenamiento: Name, PublisherCountry, PublisherName | ✅ |
| Ordenamiento por nombre, no ID | ✅ |

### Documentación actualizada

- `project/domain.md` ✅ Entidad Franchise
- `project/services.md` ✅ FranchiseService
- `project/repositories.md` ✅ FranchiseRepository
- `project/endpoints.md` ✅ Endpoints de franquicias
- `project/endpoints/endpoints-franchises.md` ✅ Documentación completa

### Build
- Exitoso: 0 errores (Application e Infrastructure).

### Criterios de aceptación cumplidos
- [x] El modelo está correctamente definido.
- [x] La persistencia funciona.
- [x] El repositorio soporta listado, búsqueda, filtros, ordenamiento y paginación.
- [x] El servicio implementa las reglas de negocio.
- [x] POST/PUT integran imagen mediante multipart.
- [x] Activate/Deactivate funcionan.
- [x] No existe DELETE físico.
- [x] La seguridad es correcta.
- [x] La documentación está alineada.
- [x] La solución compila correctamente.