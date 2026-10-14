# TASK-PUBLIC-WEB-0011 — Corregir selector de nacionalidad del formulario de registro

## Objetivo

Corregir el comportamiento del selector de nacionalidad utilizado en el formulario de registro.

## Problemas actuales

### 1. Consulta inicial

Actualmente, al posicionarse sobre el selector de países, no se realiza la consulta inicial al backend.

Al abrir o activar el selector debe realizarse una consulta utilizando:

```text
search = ""
```

La respuesta debe utilizarse para mostrar las opciones disponibles.

El comportamiento actual de búsqueda mientras el usuario escribe debe mantenerse.

El flujo esperado es:

```text
Usuario activa el selector
        ↓
Frontend consulta con search = ""
        ↓
API devuelve nacionalidades
        ↓
Frontend muestra las opciones
```

Cuando el usuario comienza a escribir:

```text
Usuario escribe
        ↓
Frontend envía search
        ↓
API devuelve coincidencias
        ↓
Frontend muestra y filtra los resultados
```

No modificar el contrato del endpoint existente.

### 2. Pérdida de foco

Cuando el usuario escribe un valor en el selector pero no selecciona explícitamente una opción y abandona el campo, debe validarse el valor ingresado.

#### Si existe una coincidencia exacta

Por ejemplo:

```text
Usuario escribe: Argentina
```

Si entre los resultados existe exactamente:

```text
Argentina
```

el componente debe seleccionar automáticamente esa opción.

#### Si no existe una coincidencia exacta

Si el valor ingresado no coincide exactamente con ninguna nacionalidad disponible, el campo debe limpiarse.

Por ejemplo:

```text
Usuario escribe: Argentinax
```

Al perder el foco:

```text
Argentinax → campo vacío
```

No debe conservarse un valor que no corresponda a una nacionalidad válida.

## Restricciones

La Task debe limitarse al comportamiento del selector de nacionalidad.

No modificar:

- El contrato del endpoint.
- La API.
- El modelo de nacionalidad.
- Otros campos del formulario.
- La lógica de registro.
- La navegación.
- Los estilos existentes, salvo que sea estrictamente necesario para corregir el comportamiento.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `public-web-architecture.md`
- `frontend-public-web-stack-technology.md`
- `frontend-coding-rules.md`
- `components.md`
- `pages.md`
- `endpoints.md`
- `communication.md`

Leer además la implementación actual del formulario de registro y del componente utilizado para seleccionar la nacionalidad.

## Criterio de finalización

La Task se considera finalizada cuando:

1. Al activar el selector se realiza una consulta con `search = ""`.
2. Las opciones obtenidas se muestran correctamente.
3. La búsqueda continúa funcionando mientras el usuario escribe.
4. Al perder el foco, una coincidencia exacta se selecciona automáticamente.
5. Al perder el foco, una entrada sin coincidencia exacta se limpia.
6. No se modificó el contrato existente con la API.
7. El comportamiento existente del resto del formulario continúa funcionando correctamente.

---

## Resultado de ejecución

### Trabajo realizado

1. **Consulta inicial al activar el selector**
   - `handleFocus` ahora consulta `searchCountries('')` cuando `items` está vacío.
   - Esto carga la primera página de países al abrir el dropdown.

2. **Búsqueda con `search = ""`**
   - `searchCountries` ya no corta la ejecución cuando `term` es vacío.
   - Ahora consulta al backend con `search: ''` y muestra los resultados paginados.

3. **Búsqueda mientras el usuario escribe**
   - Se mantiene el comportamiento existente con debounce de 300ms.

4. **Validación en blur**
   - Agregado `handleBlur` con `setTimeout(0)` para evitar conflictos con el click en opciones.
   - Si el `document.activeElement` sale del container:
     - Busca coincidencia exacta por `country.name === inputValue`.
     - Si existe: selecciona automáticamente la opción.
     - Si no existe: limpia el input, `selectedName` y notifica `onChange('')`.
   - Siempre invoca `onBlur?.()` para que React Hook Form ejecute sus validaciones.

5. **Compatibilidad**
   - No se modificaron props del componente.
   - No se modificó el contrato del endpoint.
   - El resto del formulario continúa funcionando correctamente.

### Criterios verificados

- [x] 1. Al activar el selector se realiza una consulta con `search = ""`.
- [x] 2. Las opciones obtenidas se muestran correctamente.
- [x] 3. La búsqueda continúa funcionando mientras el usuario escribe.
- [x] 4. Al perder el foco, una coincidencia exacta se selecciona automáticamente.
- [x] 5. Al perder el foco, una entrada sin coincidencia exacta se limpia.
- [x] 6. No se modificó el contrato existente con la API.
- [x] 7. El comportamiento existente del resto del formulario continúa funcionando correctamente.

### Archivos modificados

- `public-web/public-web/features/authentication/components/country-search-select.tsx`