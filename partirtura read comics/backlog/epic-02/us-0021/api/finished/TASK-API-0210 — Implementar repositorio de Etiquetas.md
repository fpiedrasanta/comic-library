# TASK-API-0210 — Implementar repositorio de Etiquetas

## Objetivo

Implementar o adaptar el repositorio de `Tag` para soportar la administración de Etiquetas.

## Documentación

Leer antes de implementar:

* `project/repositories.md`

Actualizar:

* `project/repositories.md`

## Alcance

Implementar o adaptar `ITagRepository` y `TagRepository`.

Debe soportar:

* Listar etiquetas.
* Buscar por nombre.
* Filtrar por `IsActive`.
* Ordenar.
* Paginar.
* Obtener por `Id`.
* Obtener por nombre.
* Crear.
* Actualizar.
* Persistir cambios de estado.

## Reglas

* Reutilizar infraestructura existente si `TagRepository` ya existe.
* No crear `Repository<T>` genérico.
* Respetar Repository + UnitOfWork.
* No implementar reglas de negocio en el repositorio.
* No eliminar físicamente etiquetas.
* Mantener las relaciones existentes con `Work`.

## Validación

Verificar que:

* El repositorio compile.
* Se integre correctamente con `UnitOfWork`.
* Las operaciones requeridas estén disponibles.
* Las relaciones con `Work` continúen funcionando.
* `project/repositories.md` refleje la implementación final.

No implementar servicios, endpoints ni Dashboard.
