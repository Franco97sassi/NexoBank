# Estrategia de testing

La fase 13 organiza la pirámide de pruebas en dos suites independientes.

## Backend

- `./mvnw test` ejecuta pruebas unitarias, de repositorio, controladores e integración.
- `./mvnw verify` genera el informe JaCoCo en `target/site/jacoco/index.html`.
- Las pruebas usan H2 en modo PostgreSQL y desactivan Flyway, por lo que no requieren una base externa.

## Frontend

- `npm test` ejecuta pruebas unitarias y de componentes con Vitest, Testing Library y jsdom.
- `npm run test:coverage` genera informes de cobertura de texto, HTML y LCOV, y exige umbrales mínimos.
- `npm run test:e2e` ejecuta el flujo crítico de autenticación con Playwright en Chromium.

Los tests no comparten estado: cada prueba limpia el DOM y `localStorage`. En CI se recomienda ejecutar
primero las suites rápidas y reservar E2E para después de un build exitoso.
