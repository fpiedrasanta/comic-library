# TASK-API-0121 — Definir contratos para creación y edición de países

## Objetivo

Definir los contratos necesarios para administrar los países del sistema.

## Completed Work

Pendiente.

## Pending Work

Crear los siguientes contratos:

- `CreateCountryRequest`
  - `Code`
  - `Name`

- `UpdateCountryRequest`
  - `Code`
  - `Name`

El estado `IsActive` no debe formar parte de estos contratos, ya que la activación y desactivación se gestionan mediante operaciones específicas.

El identificador del país se obtiene de la ruta durante la edición y no forma parte del body.

## Unblocked by

TASK-API-0120

## Unblocks

TASK-API-0122

## Execution Result

### Status
Finished

### Completed Work
- Created `CreateCountryRequest` with `Code` and `Name`.
- Created `UpdateCountryRequest` with `Code` and `Name`.
- `IsActive` is not part of these contracts.
- The country identifier is obtained from the route during editing.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
