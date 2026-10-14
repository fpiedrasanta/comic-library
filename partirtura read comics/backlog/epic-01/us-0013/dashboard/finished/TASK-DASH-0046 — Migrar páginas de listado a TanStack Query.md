# TASK-DASH-0046 — Migrar páginas de listado a TanStack Query

## Objetivo

Migrar las páginas de listado administrativo para utilizar TanStack Query en lugar de estado local manual con `useState` y `useEffect`.

Las siguientes páginas actualmente manejan server state manualmente:
- `UsersPage`
- `AdminsPage`
- `CountriesPage`
- `BansPage`
- `BansSelectUserPage`

Esto viola la regla de stack tecnológico que define TanStack Query como herramienta obligatoria para server state.

## Alcance

Reemplazar el patrón:
```typescript
const [data, setData] = useState<T[]>([])
const [isLoading, setIsLoading] = useState(false)
useEffect(() => { loadData() }, [params])
```

Por:
```typescript
const { data, isLoading, error } = useQuery({ queryKey, queryFn })
```

Mantener la misma UX/UI, filtros, ordenamiento y paginación.

## Criterio de aceptación

- Todas las páginas de listado utilizan `useQuery` para server state.
- El estado de loading, error y datos se deriva de TanStack Query.
- La paginación, búsqueda y ordenamiento continúan funcionando.
- No se introducen regresiones visuales ni funcionales.
- El Dashboard compila sin errores TypeScript.

## Assigned to

Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`UsersPage`**: migrada a `useQuery` con queryKey derivada de filtros, ordenamiento y paginación. Eliminado `useState`/`useEffect` manual.
2. **`AdminsPage`**: migrada a `useQuery` con invalidación de query en `deactivateAdmin`/`activateAdmin`.
3. **`CountriesPage`**: migrada a `useQuery` con invalidación de query en operaciones CRUD.
4. **`BansPage`**: migrada a `useQuery` con `useMemo` para filtros.
5. **`BansSelectUserPage`**: migrada a `useQuery`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- Paginación, búsqueda y ordenamiento funcionan correctamente con TanStack Query.
- Estados de loading, error y datos se derivan de `useQuery`.

