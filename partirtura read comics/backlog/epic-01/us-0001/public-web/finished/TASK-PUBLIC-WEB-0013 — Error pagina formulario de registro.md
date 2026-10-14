# TASK-PUBLIC-WEB-0013 — Error pagina formulario de registro

## Objetivo

Corregir el formulario de registro.

## Problemas actuales

### 1. Consulta inicial

Cuando abro la página se ve completamente en negro.

La consola muestra el siguiente error:
react-dom_client.js?v=85a3d751:20103 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
use-password-rules.ts:9 Uncaught TypeError: Cannot read properties of undefined (reading 'length')
    at use-password-rules.ts:9:27
    at mountMemo (react-dom_client.js?v=85a3d751:6527:25)
    at Object.useMemo (react-dom_client.js?v=85a3d751:18709:20)
    at exports.useMemo (chunk-PNYOJZWL.js?v=85a3d751:947:36)
    at usePasswordRules (use-password-rules.ts:5:10)
    at RegisterPage (register-page.tsx:62:25)
    at Object.react_stack_bottom_frame (react-dom_client.js?v=85a3d751:18509:20)
    at renderWithHooks (react-dom_client.js?v=85a3d751:5654:24)
    at updateFunctionComponent (react-dom_client.js?v=85a3d751:7475:21)
    at beginWork (react-dom_client.js?v=85a3d751:8525:20)
(anonymous) @ use-password-rules.ts:9
mountMemo @ react-dom_client.js?v=85a3d751:6527
useMemo @ react-dom_client.js?v=85a3d751:18709
exports.useMemo @ chunk-PNYOJZWL.js?v=85a3d751:947
(anonymous) @ use-password-rules.ts:5
(anonymous) @ register-page.tsx:62
react_stack_bottom_frame @ react-dom_client.js?v=85a3d751:18509
renderWithHooks @ react-dom_client.js?v=85a3d751:5654
updateFunctionComponent @ react-dom_client.js?v=85a3d751:7475
beginWork @ react-dom_client.js?v=85a3d751:8525
runWithFiberInDEV @ react-dom_client.js?v=85a3d751:997
performUnitOfWork @ react-dom_client.js?v=85a3d751:12561
workLoopSync @ react-dom_client.js?v=85a3d751:12424
renderRootSync @ react-dom_client.js?v=85a3d751:12408
performWorkOnRoot @ react-dom_client.js?v=85a3d751:11827
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=85a3d751:13505
performWorkUntilDeadline @ react-dom_client.js?v=85a3d751:36
react-dom_client.js?v=85a3d751:6966 An error occurred in the <RegisterPage> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.

defaultOnUncaughtError @ react-dom_client.js?v=85a3d751:6966
logUncaughtError @ react-dom_client.js?v=85a3d751:7020
runWithFiberInDEV @ react-dom_client.js?v=85a3d751:997
lane.callback @ react-dom_client.js?v=85a3d751:7048
callCallback @ react-dom_client.js?v=85a3d751:5491
commitCallbacks @ react-dom_client.js?v=85a3d751:5503
runWithFiberInDEV @ react-dom_client.js?v=85a3d751:999
commitLayoutEffectOnFiber @ react-dom_client.js?v=85a3d751:9976
flushLayoutEffects @ react-dom_client.js?v=85a3d751:12924
commitRoot @ react-dom_client.js?v=85a3d751:12803
commitRootWhenReady @ react-dom_client.js?v=85a3d751:12016
performWorkOnRoot @ react-dom_client.js?v=85a3d751:11950
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=85a3d751:13505
performWorkUntilDeadline @ react-dom_client.js?v=85a3d751:36


### 2. No carga la página

Directamente no carga la página, pero si carga el login.

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

## Criterio de finalización

La Task se considera finalizada cuando:

1. Puedo ingresar al formulario.

---

## Resultado de ejecución

### Trabajo realizado

Corregido el crash en `RegisterPage` causado por `useWatch` devolviendo `undefined` en el render inicial.

**Cambio:**
- `register-page.tsx`: se agregó `defaultValue: ''` a la llamada `useWatch({ control, name: 'password' })`.

**Causa raíz:**
- `useWatch` devuelve `undefined` hasta que el campo se monta con un valor inicial.
- `usePasswordRules` recibía `undefined` y ejecutaba `password.length`, provocando el crash y la pantalla en negro.

**Verificación:**
- `tsc --noEmit` compila sin errores.
- La página de registro ahora carga correctamente.
- No se modificaron contratos API, estilos ni lógica de registro.

### Archivos modificados

- `public-web/public-web/pages/register-page.tsx`