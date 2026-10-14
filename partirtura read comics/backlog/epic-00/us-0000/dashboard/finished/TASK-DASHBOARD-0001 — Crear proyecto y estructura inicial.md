TASK-DASHBOARD-0001 — Crear proyecto y estructura inicial

Crear el proyecto Dashboard y establecer su estructura inicial de acuerdo con dashboard-architecture.md.

Configurar la estructura inicial de páginas y componentes necesaria para comenzar el desarrollo funcional.

Verificar que el proyecto compile y pueda ejecutarse correctamente.

## Resultado de la ejecución

El proyecto Dashboard fue creado en `dashboard/` con estructura feature-based:

```text
dashboard/
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  tailwind.config.ts
  index.html
  .gitignore
  .env
  .env.development
  .env.test
  .env.production
  components.json
  public/
  dashboard/
    vite-env.d.ts
    index.css
    main.tsx
    app.tsx
    app/
      providers/
        query-provider.tsx
      router/
        routes.tsx
    components/
      ui/
        button.tsx
    features/
      authentication/
      catalog/
      people/
      roles/
      publishers/
      languages/
      franchises/
      series/
      numbers/
      lists/
      media/
      users/
      statistics/
      ai-assistance/
    pages/
      dashboard-layout.tsx
      home-page.tsx
    infrastructure/
      api/
        client/
          api-client.ts
        endpoints/
      auth/
    hooks/
    lib/
      utils.ts
    store/
      ui-store.ts
    types/
      api.ts
```

Configuración aplicada:
- Vite + React 19 + TypeScript
- React Router con ruta inicial `/`
- TanStack Query provider
- Tailwind CSS con variables CSS para theming
- Zustand para estado de cliente
- shadcn/ui inicializado con `components.json`
- Alias `@` apuntando a `dashboard/`

Verificación:
- `npx tsc --noEmit` pasa sin errores
- `npm run build` genera el bundle exitosamente

El proyecto está preparado para comenzar el desarrollo funcional.
