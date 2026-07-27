# DevOps y despliegue

La fase 14 automatiza la validación, construcción, publicación y despliegue de NexoBank.

## Entorno local

1. Copia `.env.example` como `.env` y sustituye las credenciales de ejemplo.
2. Ejecuta `docker compose up --build -d`.
3. Abre `http://localhost:5173`. Nginx sirve la SPA y reenvía `/api` al backend.
4. Detén el entorno con `docker compose down` (agrega `-v` para eliminar también los datos).

`docker compose config` permite validar la configuración resuelta antes de arrancar. Los valores del
archivo `.env` nunca deben versionarse.

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada pull request y push a `main` o `work`. Verifica el backend
con Maven, el frontend con lint, Vitest y build, y finalmente construye las dos imágenes Docker. Los JAR
y el `dist` generado se conservan como artefactos de la ejecución.

## Publicación y despliegue

Al integrar cambios en `main`, `.github/workflows/deploy.yml` publica ambas imágenes en GitHub Container
Registry con etiquetas `latest` y SHA. Luego actualiza el servidor del environment `production` usando
`docker-compose.prod.yml`.

El servidor debe tener Docker Compose, una copia del repositorio en `DEPLOY_PATH`, un `.env` productivo y
acceso de lectura a las imágenes (ejecuta previamente `docker login ghcr.io` si el paquete es privado).
Configura estos secrets en el environment `production`:

- `DEPLOY_HOST`: hostname o IP del servidor.
- `DEPLOY_USER`: usuario SSH con acceso a Docker.
- `DEPLOY_SSH_KEY`: clave SSH privada.
- `DEPLOY_PATH`: ruta absoluta de la copia del repositorio.

El `.env` productivo debe definir como mínimo `POSTGRES_PASSWORD`, `JWT_SECRET`, `IMAGE_NAMESPACE` y los
orígenes CORS. La base de datos y el backend no publican puertos en producción; Nginx es el único punto de
entrada. Los despliegues manuales también se pueden lanzar con `workflow_dispatch`.
