# Panel web de FerreLupe

Panel donde la ferretería supervisa las conversaciones de WhatsApp, las cotizaciones y el catálogo. Está hecho con React, TypeScript y Vite, con CSS propio. La API está en el repositorio `tesis-backend`.

En producción, nginx sirve el panel y reenvía las llamadas a `/api` a la dirección de la variable `API_URL` (la URL del backend en Cloud Run). Así el panel y la API se ven como un solo sitio y no hace falta configurar CORS.

## Estructura

- `src/paginas`: una página por archivo (conversaciones, cotizaciones, productos, usuarios, configuración y perfil).
- `src/componentes`: componentes compartidos.
- `src/api.ts`: llamadas a la API con el token de la sesión.
- `src/estilos.css`: CSS propio, responsive, sin frameworks.
- La base de datos y sus scripts están en `tesis-backend/basedatos`.

## Perfiles

- **Administrador:** todo lo del vendedor, además de productos, usuarios y configuración del asistente.
- **Vendedor:** conversaciones, respuesta manual y cotizaciones; solo consulta los productos.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias. |
| `npm run dev` | Abre el panel en http://localhost:5173. Las llamadas a `/api` se envían al backend en http://localhost:8080, que debe estar encendido. |
| `npm run build` | Revisa los tipos y genera la versión de producción en `dist/`. |
| `npm test` | Ejecuta las pruebas con Vitest. Con `npx vitest run --coverage` se mide la cobertura. |
| `docker compose up --build` | Levanta el panel con nginx en http://localhost:3000, conectado al backend en el puerto 8080 del equipo. |

## Despliegue en Google Cloud Run

El archivo `.github/workflows/desplegar.yml` despliega el panel en el servicio `ferrelupe-frontend` de Cloud Run cada vez que se sube un cambio a la rama `main` (también se puede ejecutar a mano desde la pestaña Actions de GitHub), con mínimo 0 instancias para que no cobre cuando nadie lo usa.

En GitHub, en Settings → Secrets and variables → Actions, crea estos secretos. El primer paso del pipeline los revisa y, si falta alguno, se detiene e indica cuál.

| Secreto | Valor |
|---|---|
| `GCP_CREDENCIALES` | Contenido del JSON de la cuenta de servicio (la misma del backend) |
| `GCP_PROYECTO` | Identificador del proyecto de Google Cloud |
| `API_URL` | URL del servicio `ferrelupe-backend`, sin `/` al final (por ejemplo, `https://ferrelupe-backend-xxxx.southamerica-west1.run.app`) |

Despliega primero el backend, para conocer su URL.
