TASK-PUBLIC-WEB-0002 — Configurar stack y dependencias iniciales
Instalar las dependencias definidas en frontend-public-web-stack-technology.md.
Configurar las herramientas necesarias.
Configurar la estructura inicial de estilos.
Configurar cualquier librería transversal definida por el stack.
Verificar que las dependencias estén correctamente integradas.

Esta depende de 0001.

## Resultado de la ejecución

Dependencias instaladas según `frontend-public-web-stack-technology.md`:

**Core:**
- react, react-dom
- react-router-dom
- @tanstack/react-query
- zustand
- react-hook-form
- zod

**Estilos:**
- tailwindcss
- postcss
- autoprefixer

**UI:**
- class-variance-authority
- clsx
- tailwind-merge
- @radix-ui/react-slot

**Dev:**
- @types/react, @types/react-dom
- @vitejs/plugin-react
- typescript
- vite

Herramientas configuradas:
- Tailwind CSS v3 con PostCSS
- `tailwind.config.ts` con colores basados en variables CSS
- `postcss.config.js`
- `components.json` para shadcn/ui
- Componente base `Button` creado en `components/ui/button.tsx`
- `lib/utils.ts` con función `cn()` para merges de clases

Verificación:
- `npm run build` completo exitosamente
