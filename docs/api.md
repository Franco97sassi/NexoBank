# Guía de la API

## Contrato interactivo

Con el backend iniciado, springdoc genera el contrato directamente desde los controllers y DTOs:

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/api-docs>

En Swagger, use **Authorize** con el JWT devuelto por el login. El contrato descargable también permite generar
clientes o importarlo en herramientas de pruebas. La colección Postman versionada ofrece un recorrido preparado.

## Autenticación

| Método | Ruta | Propósito |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Crear usuario cliente |
| `POST` | `/api/v1/auth/login` | Obtener access y refresh token |
| `POST` | `/api/v1/auth/refresh` | Rotar la sesión con el refresh token |
| `POST` | `/api/v1/auth/logout` | Revocar el refresh token |

Ejemplo:

```bash
curl -s http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"cliente@nexobank.local","password":"NexoBank123!"}'

curl -s http://localhost:8080/api/v1/accounts \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

El access token es de vida corta. No envíe el refresh token como bearer: úselo exclusivamente en `refresh` y
`logout`. Ante `401`, renueve una vez la sesión; ante `403`, el usuario está autenticado pero carece del rol.

## Recursos

| Recurso | Base | Operaciones principales |
| --- | --- | --- |
| Usuarios | `/api/v1/users` | perfil propio y CRUD administrativo |
| Clientes | `/api/v1/customers` | listado paginado y CRUD |
| Cuentas | `/api/v1/accounts` | listado, detalle, alta y actualización |
| Movimientos | `/api/v1/transactions` | filtros, depósitos, retiros y ajustes |
| Destinatarios | `/api/v1/beneficiaries` | listado y CRUD |
| Transferencias | `/api/v1/transfers` | listado, creación idempotente y comprobante |
| Auditoría | `/api/v1/audit-events` | consulta administrativa paginada |
| Fraude | `/api/v1/fraud-alerts` | consulta y revisión administrativa |
| Administración | `/api/v1/admin/dashboard` | métricas agregadas |

Los listados aceptan `page` y `size` y devuelven `content`, `page`, `size`, `totalElements` y `totalPages`.
Cada recurso puede añadir filtros específicos que aparecen en Swagger.

## Flujo de datos de ejemplo

1. Registre o cree un usuario.
2. Cree su perfil de cliente con el `userId`.
3. Abra una cuenta con el `customerId`.
4. Deposite fondos usando el `accountId`.
5. Cree un destinatario con el `customerId` y una CBU de 22 dígitos.
6. Transfiera indicando `sourceAccountId`, `beneficiaryId`, importe y una `idempotencyKey` nueva.
7. Descargue/consulte el comprobante con el ID de transferencia.

## Errores

Los errores usan JSON con estado HTTP, mensaje, ruta y, cuando falla la validación, una lista de campos. Códigos
habituales:

- `400`: JSON o parámetros inválidos.
- `401`: credenciales ausentes, inválidas o vencidas.
- `403`: permisos insuficientes.
- `404`: recurso inexistente o no visible para el usuario.
- `409`: conflicto de unicidad, estado, saldo o idempotencia.

No implemente reglas basándose únicamente en el texto del mensaje; use el código HTTP y el campo afectado.

## Postman

Importe `docs/postman/NexoBank.postman_collection.json`. La colección define `baseUrl`, `accessToken`,
`refreshToken` e IDs encadenables. Ejecute primero **Auth / Login**; su script guarda ambos tokens. Los ejemplos de
creación guardan los IDs de la respuesta y `Create transfer` genera una clave idempotente con `$guid`.
