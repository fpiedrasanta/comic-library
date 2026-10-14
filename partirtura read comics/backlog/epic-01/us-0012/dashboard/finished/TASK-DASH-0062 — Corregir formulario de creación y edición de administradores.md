# TASK-DASH-0062 — Corregir formulario de creación y edición de administradores

## ID
TASK-DASH-0062

## Título
Corregir formulario de creación y edición de administradores

## Estado
finished

## Descripción
La ventana de creación de administradores presenta múltiples defectos que impiden el flujo completo de administración de usuarios con rol `Administrator`. Esta Task corrige los problemas reportados en el formulario y la grilla.

## Resultado esperado
Formulario de administradores funcional con todas las validaciones, selects e integración con backend operativos.

## Contexto relevante
- User Story: US-0012 — Administrar usuarios administradores
- Epic: EPIC-01 — Gestión de usuarios e identidad
- Documentación: `project/frontend-dashboard-stack-technology.md`, `project/frontend-coding-rules.md`, `project/dashboard-architecture.md`, `project/pages.md`, `project/components.md`
- Tareas relacionadas: TASK-DASH-0036, TASK-DASH-0038

## Dependencias
- TASK-API-0147 — Implementar endpoint de consulta individual de usuario administrador

## Criterios de aceptación
- [x] El avatar puede seleccionarse correctamente en la creación de administrador.
- [x] El select de país filtra correctamente y solo muestra países existentes en la base de datos.
- [x] El select de país reutiliza el componente existente del Public Web, adaptado con estilos del Dashboard.
- [x] La validación de contraseña exige: mínimo 8 caracteres, al menos una mayúscula, al menos una minúscula, al menos un número, al menos un símbolo (no O).
- [x] Al guardar un administrador, la grilla de listado muestra el nuevo registro sin necesidad de recargar la página (F5).
- [x] Al editar un administrador, el formulario carga correctamente los datos existentes.
- [x] Los mensajes de error se muestran en español, no como errores HTTP crudos.

## Ejecución
- **Archivos modificados**:
  - `dashboard/features/users/components/country-search-select.tsx` (nuevo)
  - `dashboard/features/users/services/admin.service.ts`
  - `dashboard/pages/admin-form-page.tsx`
- **Documentación actualizada**:
  - `project/components.md`
  - `project/pages.md`
- **Build**: Compila correctamente.
