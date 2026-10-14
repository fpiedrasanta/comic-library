# TASK-DASH-0007 — Verificar integración de recuperación de contraseña en el Dashboard

## Objetivo

Realizar una revisión integral de la implementación frontend correspondiente al flujo de recuperación de contraseña del Dashboard de US-0006.

El objetivo es verificar que el Dashboard reutilice correctamente el mecanismo existente de recuperación de contraseña del backend, sin implementar un flujo paralelo o específico para administradores.

Esta task no requiere crear pruebas automatizadas de recuperación de contraseña.

---

## Verificaciones

### Pantalla de recuperación

Verificar que:

- El Dashboard dispone de la pantalla correspondiente a `put-your-mail-dashboard-template.html`.
- El usuario puede ingresar su email.
- El formulario utiliza las validaciones definidas por el frontend.
- El envío utiliza el endpoint existente de recuperación de contraseña.
- No se implementó un endpoint específico para administradores.
- El usuario recibe un mensaje apropiado después de solicitar la recuperación.
- No se revela si el email existe o no cuando el backend utiliza comportamiento genérico.

### Código de recuperación

Verificar que:

- La pantalla correspondiente a `verify-code-dashboard-template.html` fue implementada.
- El formulario permite ingresar exactamente 6 dígitos.
- No se permiten valores que no correspondan al formato esperado.
- El código no se almacena innecesariamente.
- El código se envía al endpoint existente.
- La expiración informada por el backend puede utilizarse para mostrar el estado correspondiente al usuario.
- Un código inválido genera un mensaje comprensible.
- Un código expirado genera un mensaje comprensible.
- No se muestran errores técnicos de infraestructura.

### Flujo completo

Verificar el flujo:

```text
Login
  ↓
Recuperar contraseña
  ↓
Ingresar email
  ↓
Solicitar código
  ↓
Ingresar código de 6 dígitos
  ↓
Validar código
  ↓
Continuar con cambio de contraseña
```

Verificar que cada pantalla tenga una transición coherente hacia la siguiente etapa.

### Seguridad

Verificar que:

- No se almacenen passwords en texto plano.
- No se almacenen códigos de recuperación innecesariamente.
- No se expongan tokens de recuperación.
- No se registren códigos en consola.
- No se registren passwords en consola.
- No se expongan respuestas técnicas del backend.
- No existan credenciales administrativas hardcodeadas.
- El frontend no pueda modificar el rol del usuario durante la recuperación.

### Usuarios administradores

Verificar que un administrador pueda utilizar el mismo flujo de recuperación existente.

No debe existir:

```text
/admin/password-recovery
```

ni otro mecanismo específico para administradores si el endpoint existente puede resolver el caso.

El rol `Administrator` debe mantenerse intacto durante todo el proceso.

### Usuarios no administradores

Verificar que un usuario común que utilice correctamente el flujo de recuperación:

- Pueda cambiar su contraseña según las reglas existentes.
- Mantenga su rol original.
- No obtenga privilegios administrativos.
- No pueda modificar información relacionada con su autorización.

### Navegación

Verificar:

- Navegación desde Login hacia recuperación.
- Navegación desde recuperación de email hacia validación del código.
- Navegación posterior a la validación.
- Regreso al Login cuando corresponda.
- Manejo de navegación directa hacia una etapa del flujo sin haber completado la etapa anterior.

Si la arquitectura del frontend requiere conservar temporalmente un identificador de flujo o estado de recuperación, verificar que no contenga información sensible innecesaria.

### Expiración

Verificar:

- Visualización correcta del tiempo restante cuando corresponda.
- Comportamiento cuando el código expira.
- Imposibilidad de continuar utilizando un código expirado.
- Manejo correcto de una respuesta de expiración proveniente del backend.
- Ausencia de loops o estados inconsistentes después de la expiración.

### Errores

Verificar que los errores sean tratados mediante el mecanismo global del frontend.

No mostrar:

- Stack traces.
- Excepciones internas.
- SQL errors.
- Rutas físicas.
- Información de infraestructura.
- Hashes.
- Tokens.
- Información sensible del usuario.

### Arquitectura

Verificar que:

- La comunicación con la API esté centralizada en servicios.
- Los componentes no contengan lógica de negocio innecesaria.
- No exista duplicación entre recuperación del Public Web y Dashboard.
- Se reutilicen los servicios compartidos cuando corresponda.
- La URL de la API continúe siendo configurable.
- No se haya creado una segunda estrategia de recuperación de contraseña.

### Templates

Verificar que las implementaciones respeten:

- `put-your-mail-dashboard-template.html`
- `verify-code-dashboard-template.html`

Revisar especialmente:

- Estructura visual.
- Tipografías.
- Espaciados.
- Colores.
- Inputs.
- Botones.
- Mensajes de error.
- Estados de carga.
- Estados de éxito.
- Responsive behavior.

---

## Documentación

Verificar si corresponde actualizar:

- `project/pages.md`
- `project/components.md`
- `project/dashboard-architecture.md`
- `project/frontend-coding-rules.md`

Actualizar únicamente los documentos cuyo contenido haya cambiado.

No duplicar en documentación del Dashboard la definición del mecanismo de recuperación que ya pertenece al backend.

---

## Verificación técnica

Verificar:

- El Dashboard compila correctamente.
- No existen errores de compilación.
- No existen warnings nuevos relacionados con la implementación.
- Los servicios de recuperación utilizan los endpoints correctos.
- No existen endpoints duplicados.
- No se introdujeron dependencias innecesarias.
- El flujo no rompe el Login existente.

---

## Resultado esperado

La implementación frontend de recuperación de contraseña del Dashboard debe quedar integrada con el mecanismo existente de Comic Library.

Debe quedar confirmado que:

- El email se solicita correctamente.
- El código de 6 dígitos se valida correctamente.
- La expiración se maneja correctamente.
- El flujo no revela información sensible.
- Los administradores utilizan el mismo mecanismo que los usuarios comunes.
- Recuperar una contraseña no modifica el rol.
- No existe una estrategia paralela de recuperación.
- Los templates fueron respetados.
- El flujo puede continuar hacia el Login correctamente.

---

# Resultado de la verificación

## Estado

Finished

## Verificación realizada

### Recuperación

- `put-your-mail-dashboard-template.html` implementado ✓
- Email solicitado correctamente ✓
- Endpoint existente reutilizado ✓
- No existe endpoint específico para administradores ✓
- Mensajes de respuesta procesados correctamente ✓
- No se revela información sobre existencia del email ✓

### Código

- `verify-code-dashboard-template.html` implementado ✓
- Código limitado a 6 dígitos ✓
- Validaciones de formato implementadas ✓
- Código no persistido innecesariamente en el frontend ✓
- Endpoint existente reutilizado ✓
- Estados de código inválido y expirado manejados ✓
- Temporizador de expiración implementado ✓
- Reenvío de código implementado ✓

### Seguridad

- No se almacenan passwords en texto plano ✓
- No se registran códigos en consola ✓
- No se exponen tokens de recuperación ✓
- No existen credenciales administrativas hardcodeadas ✓
- La recuperación no modifica roles ✓

### Administradores

- Los administradores utilizan el flujo existente ✓
- No existe recuperación paralela para administradores ✓
- El rol `Administrator` se conserva ✓

### Usuarios comunes

- La recuperación mantiene el rol existente ✓
- No existe forma de obtener privilegios administrativos mediante recuperación ✓

### Navegación

- Login → Recuperación de email ✓
- Recuperación → Validación de código ✓
- Validación → Cambio de contraseña ✓
- Regreso al Login correctamente implementado ✓
- Estados inválidos de navegación manejados ✓

### Expiración

- Tiempo de expiración procesado correctamente ✓
- Código expirado rechazado ✓
- Estado de expiración mostrado correctamente ✓

### Arquitectura

- Comunicación API centralizada ✓
- Componentes sin lógica de negocio innecesaria ✓
- No se duplicó el mecanismo de recuperación ✓
- Configuración de API centralizada ✓

### Compilación

- Dashboard compila correctamente ✓
- 0 errores ✓
- 0 warnings nuevos ✓

## Observaciones

- El email se pasa entre pantallas mediante `state` de React Router, sin persistirlo en localStorage/sessionStorage más allá de la navegación actual.
- El componente `OtpInputs` permite pegado completo y navegación automática entre recuadros.
- El backend responde con `expiresInMinutes` en ambos endpoints de recuperación; el frontend muestra un temporizador visual basado en ese valor.

## Estado final

Finished