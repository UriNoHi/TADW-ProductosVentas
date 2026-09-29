# Productos Ventas API

API GraphQL construida con Node.js, Express, Apollo Server 4, Mongoose y MongoDB Atlas. Está preparada para ejecutarse localmente y desplegarse en Render.

## Arquitectura

```text
Cliente / Apollo Sandbox
          |
          v
Express HTTP server (/health, /graphql)
          |
          v
Apollo Server (SDL + resolvers, introspección habilitada)
          |
          v
Mongoose (modelo Product y validaciones)
          |
          v
MongoDB Atlas
```

## Estructura

```text
ProductosVentas/
|-- src/
|   |-- models/
|   |   `-- Product.js       # Esquema Mongoose y validaciones
|   |-- db.js                # Conexión y desconexión de MongoDB
|   |-- schema.js            # SDL GraphQL
|   |-- resolvers.js         # Queries, filtros y mutación
|   `-- server.js            # Express, Apollo, health check y señales
|-- .env.example             # Variables requeridas, sin secretos
|-- .gitignore
|-- ARCHITECTURE.md
|-- package.json
`-- package-lock.json
```

## Modelo y contrato GraphQL

La base de datos de Atlas es `ProductosVentas` y la colección es `productos`. `Product` contiene `id`, `name`, `price`, `stock`, `category` y `description`. Mongoose agrega `createdAt` y `updatedAt` internamente, pero no se exponen en el SDL.

### Queries

```graphql
query Products($filter: ProductFilterInput) {
  products(filter: $filter) {
    id
    name
    price
    stock
    category
    description
  }
}
```

Ejemplo de variables:

```json
{
  "filter": {
    "category": "laptop",
    "minPrice": 500,
    "maxPrice": 2500,
    "inStock": true
  }
}
```

También existe `product(id: ID!)` para buscar un producto concreto.

### Mutación

`updateProduct(id: ID!, input: UpdateProductInput!)` actualiza únicamente los campos enviados y ejecuta las validaciones de Mongoose.

```graphql
mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    name
    price
    stock
    category
    description
  }
}
```

## Configuración local

1. Instalar Node.js 20 o superior.
2. Ejecutar `npm install`.
3. Copiar `.env.example` a `.env`.
4. Definir `MONGODB_URI` con la cadena de conexión de MongoDB Atlas. No subir `.env` al repositorio.
5. Ejecutar `npm run dev` o `npm start`.
6. Abrir `http://localhost:4000/graphql` para Apollo Sandbox.
7. Comprobar `http://localhost:4000/health`.

La conexión se valida al arrancar. El endpoint `health` responde `200` con `database: connected` cuando Mongoose está conectado y `503` si la conexión se pierde.

### Verificación de conexión

La prueba de arranque realizada con la URI configurada alcanzó MongoDB Atlas, pero Atlas rechazó el acceso porque la IP de origen no está autorizada. En Atlas, abrir **Security > Network Access**, añadir la IP pública desde la que se ejecuta la aplicación (o la red de salida de Render) y volver a ejecutar `npm start`. El mensaje esperado es `MongoDB conectado: ...`; después, `GET /health` debe devolver `200` y `database: connected`.

Las credenciales proporcionadas fueron usadas únicamente en el `.env` local, que está excluido por `.gitignore`. No se incluyen en este repositorio ni en la documentación.

## Despliegue en Render

- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variable:** `MONGODB_URI` con la URI completa de Atlas
- **Environment Variable opcional:** `PORT` (Render la proporciona automáticamente)

El servidor escucha en `0.0.0.0` y utiliza `PORT`, requisitos necesarios para Render. En MongoDB Atlas se debe autorizar la IP de salida de Render mediante Network Access. Para una primera prueba puede usarse `0.0.0.0/0`, aunque en producción conviene restringir el acceso según la estrategia de red disponible.

## Seguridad y operación

- Las credenciales se configuran únicamente como variables de entorno.
- La introspección GraphQL está habilitada para Apollo Sandbox.
- CORS está habilitado para permitir clientes web.
- El modelo rechaza precios y stock negativos.
- La actualización usa `runValidators: true`.
- Se recomienda rotar las credenciales que hayan sido compartidas fuera del gestor de secretos y configurar una base de datos específica, por ejemplo `productos_ventas`, en la URI.
