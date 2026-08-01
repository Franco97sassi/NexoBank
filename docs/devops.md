# DevOps para el entorno local

La fase 14 se limita al uso local: no publica imágenes ni despliega la aplicación en un proveedor externo.
Incluye un entorno reproducible con Docker Compose, variables configurables, builds de contenedores y una
integración continua que valida cada cambio.

## Variables de entorno

Copie el ejemplo antes de personalizar puertos o credenciales locales:

```bash
cp .env.example .env
```

Docker Compose carga `.env` automáticamente. El archivo no se versiona y `.env.example` documenta todos los
valores utilizados por los servicios. Los valores predeterminados son solo para desarrollo local.

## Ejecución local

```bash
docker compose up --build
```

La aplicación queda disponible en `http://localhost:5173`, la API en `http://localhost:8080` y PostgreSQL en el
puerto `5434`. Para comprobar la configuración sin iniciar servicios use:

```bash
docker compose --env-file .env.example config --quiet
```

Para detener el entorno use `docker compose down`; añada `-v` cuando también quiera borrar los datos locales.

## Integración continua

El workflow `.github/workflows/ci.yml` se ejecuta en pushes a las ramas principales, pull requests y ejecuciones
manuales. Sus trabajos independientes realizan:

- backend: compilación, pruebas y cobertura JaCoCo con Java 21;
- frontend: instalación reproducible, cobertura, lint, formato, build y pruebas E2E;
- contenedores: validación de Compose y build de las imágenes de backend y frontend.

Los informes de cobertura y Playwright se guardan como artefactos aun cuando una prueba falle. El workflow no
contiene credenciales, no publica imágenes y no realiza despliegues.
