TASK-PUBLIC-WEB-0001 — Crear proyecto y estructura inicial
Crear el proyecto Public Web.
Configurar la estructura definida en public-web-architecture.md.
Configurar la estructura inicial de páginas y componentes.
Verificar que el proyecto compile y pueda ejecutarse.
Dejar preparado el proyecto para comenzar el desarrollo funcional.

## Resultado de la ejecución

El proyecto Public Web fue creado en `public-web/` con estructura feature-based:

```text
public-web/
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  index.html
  .gitignore
  .env
  .env.development
  .env.test
  .env.production
  components.json
  public/
  public-web/
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
      comics/
      reader/
      library/
      ratings/
      recommendations/
      profile/
    pages/
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
    types/
      api.ts
```

Configuración aplicada:
- Vite + React 19 + TypeScript
- React Router con ruta inicial `/`
- TanStack Query provider
- Tailwind CSS con variables CSS para theming
- shadcn/ui inicializado con `components.json`
- Alias `@` apuntando a `public-web/`

Verificación:
- `npx tsc --noEmit` pasa sin errores
- `npm run build` genera el bundle exitosamente

El proyecto está preparado para comenzar el desarrollo funcional.
