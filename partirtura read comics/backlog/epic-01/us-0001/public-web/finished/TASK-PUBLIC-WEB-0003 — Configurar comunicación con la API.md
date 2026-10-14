# TASK-PUBLIC-WEB-0003 — Configurar comunicación con la API

Configurar la comunicación del Public Web con la API.

La URL base de la API debe ser configurable mediante la configuración correspondiente al entorno, de manera que pueda utilizarse una URL diferente para Development, Testing y Production sin modificar el código fuente.

La URL de la API no debe estar hardcodeada en páginas, componentes, servicios ni ningún otro código de la aplicación.

Crear un mecanismo centralizado para que los servicios del Public Web obtengan la URL base de la API.

Verificar que el cliente HTTP utilice correctamente esta configuración.

Si esta implementación establece una regla general para todo el frontend, actualizar `frontend-coding-rules.md` para documentarla.

## Resultado de la ejecución

Se creó el API client centralizado en `public-web/infrastructure/api/client/api-client.ts`.

Características:
- URL base obtenida desde `import.meta.env.VITE_API_URL`
- Valor por defecto: `http://localhost:5000/api`
- No hardcodeada en páginas, componentes ni servicios
- Mecanismo centralizado para toda la comunicación HTTP
- Tipado genérico `<T>` para respuestas
- Manejo de errores HTTP normalizado

Configuración por entorno:
- `.env` → `http://localhost:5000/api`
- `.env.development` → `http://localhost:5000/api`
- `.env.test` → `http://localhost:5001/api`
- `.env.production` → `https://api.comiclibrary.com/api`

Verificación:
- `npx tsc --noEmit` pasa sin errores
- El cliente utiliza correctamente la configuración de entorno

Actualización de documentación:
- `endpoints.md` no fue modificado (no existen endpoints definidos aún)
- No se generó una nueva Task de bloqueo porque no se requirió un endpoint inexistente
