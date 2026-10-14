# TASK-PUBLIC-WEB-0032 — Hacer opcional la nacionalidad durante el registro

## Objetivo

Revisar y corregir el formulario de registro del Public Web para que la nacionalidad sea completamente opcional.

La nacionalidad es un dato que el usuario puede proporcionar si lo desea, pero no constituye un requisito para crear una cuenta.

---

## 1. Regla de negocio

El formulario debe permitir registrar un usuario sin seleccionar nacionalidad.

Debe ser válido:

```text
Nombre
Apellido
Email
Password
Confirmación de password
Nacionalidad: no seleccionada
        ↓
Registro exitoso
```

También debe continuar siendo válido:

```text
Nombre
Apellido
Email
Password
Confirmación de password
Nacionalidad: seleccionada
        ↓
Registro exitoso
```

---

## 2. Interfaz

La nacionalidad debe presentarse como un campo opcional.

No debe existir:

- Indicador visual de campo obligatorio.
- Validación que impida continuar cuando está vacío.
- Mensaje de error indicando que la nacionalidad es requerida.
- Selección automática de una nacionalidad por defecto.

Si el diseño actual utiliza un selector de países, permitir que permanezca sin selección.

---

## 3. Request al Backend

Cuando el usuario no seleccione nacionalidad, el frontend debe enviar el valor de acuerdo con el contrato vigente del endpoint.

Preferentemente:

```json
{
  "nationalityId": null
}
```

Si el contrato existente utiliza ausencia de propiedad en lugar de `null`, respetar el contrato documentado en `project/endpoints.md`.

No enviar un país arbitrario como valor por defecto.

---

## 4. Validaciones

Revisar todas las validaciones asociadas al formulario de registro.

La nacionalidad no debe participar como condición para habilitar el envío del formulario.

Las demás validaciones del registro deben mantenerse sin cambios.

---

## 5. Compatibilidad con Google Login

No agregar nacionalidad como requisito del flujo Google.

Si el usuario se registra mediante Google y posteriormente completa su perfil, podrá seleccionar nacionalidad en ese momento.

---

## 6. Prototipos y UX/UI

Revisar el prototipo existente del registro para mantener su diseño y comportamiento visual.

No modificar el diseño general del formulario salvo lo necesario para representar correctamente que la nacionalidad es opcional.

---

## 7. Componentes reutilizables

Si el selector de nacionalidad es un componente reutilizable, revisar su API para que pueda operar correctamente como campo opcional.

No crear un nuevo componente si ya existe uno que puede reutilizarse.

---

## 8. Documentación

Si se modifica el comportamiento general de una página o componente, actualizar únicamente los documentos permitidos:

- `project/pages.md`
- `project/components.md`
- `project/frontend-coding-rules.md`
- `project/public-web-architecture.md`

No modificar:

- `project/project.md`
- `project/communication.md`
- `project/endpoints.md`
- `project/frontend-public-web-stack-technology.md`

salvo que exista una razón explícita y compatible con las reglas de acceso del agente.

---

## Criterios de finalización

1. El formulario permite registrarse sin seleccionar nacionalidad.
2. La nacionalidad no aparece como campo obligatorio.
3. No existe validación que requiera nacionalidad.
4. No se asigna una nacionalidad automáticamente.
5. Cuando se selecciona una nacionalidad, se continúa enviando correctamente.
6. Cuando no se selecciona, se envía `null` o el formato establecido por el contrato del endpoint.
7. El resto de las validaciones del registro permanece sin cambios.
8. Google Login no requiere nacionalidad.
9. Se reutilizan componentes existentes cuando sea posible.
10. La implementación respeta los prototipos existentes.
 11. El Public Web compila correctamente.

---
Result:
Completed.

Completed work:
- Updated `registerSchema` in `register-page.tsx` to make `nationalityId` optional using `z.string().optional()`.
- Removed the validation error message that forced users to select a country.
- Updated the `onSubmit` handler in `register-page.tsx` to conditionally append `nationalityId` to `FormData` only when the user has selected a country.
- When no country is selected, the field is omitted from the request, and the backend treats it as `null` per the updated API contract.
- The existing `CountrySearchSelect` component already supports an empty/unselected state, so no component changes were required.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The form can be submitted with or without a selected country.
- When a country is selected, it continues to be sent correctly.
- When no country is selected, `nationalityId` is not sent, and the backend handles it as `null`.
- No default country is assigned automatically.

Notes:
- The backend (TASK-API-0051) already made `CountryId` nullable and updated validation to only check country when `NationalityId` is provided.
- No changes to `pages.md`, `components.md`, or `frontend-coding-rules.md` were necessary.