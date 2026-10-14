TASK-DASHBOARD-0003 — Configurar comunicación con la API

Configurar la comunicación del Dashboard con la API.

La URL base de la API debe ser configurable mediante la configuración correspondiente al entorno, de manera que pueda utilizarse una URL diferente para Development, Testing y Production sin modificar el código fuente.

La URL de la API no debe estar hardcodeada en páginas, componentes, servicios ni ningún otro código de la aplicación.

Crear un mecanismo centralizado para que los servicios del Dashboard obtengan la URL base de la API.

Verificar que el cliente HTTP utilice correctamente esta configuración.

Si esta implementación establece una regla general para todo el frontend, actualizar frontend-coding-rules.md para documentarla.

## Resultado de la ejecución

La comunicación del Dashboard con la API fue configurada correctamente.

Implementación:
- API Client centralizado en `dashboard/infrastructure/api/client/api-client.ts`
- URL base obtenida desde `import.meta.env.VITE_API_BASE_URL`
- Valor por defecto: `http://localhost:5000/api`
- La URL no está hardcodeada en componentes, páginas ni servicios

Configuración de entornos:
- `.env` → `http://localhost:5000/api`
- `.env.development` → `http://localhost:5000/api`
- `.env.test` → `http://localhost:5000/api`
- `.env.production` → `https://api.comiclibrary.com/api`

El cliente HTTP:
- Centraliza la comunicación en `apiClient<T>()`
- Normaliza errores mediante `handleResponse<T>()`
- Incluye tipo `ApiError` con `status` y `message`
- Utiliza exclusivamente variables de entorno para la URL base

Verificación:
- `npx tsc --noEmit` pasa sin errores
- La URL base se resuelve desde configuración de entorno, no desde código fuente

Documentación:
- `frontend-coding-rules.md` ya documenta la regla de API Base URL en su sección 82, alineada con esta implementación.

El Dashboard queda preparado para comunicarse con la API en todos los entornos sin modificar código fuente.
