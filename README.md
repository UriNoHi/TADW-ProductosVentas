# Productos Ventas API

API de productos con Express, Apollo Server, GraphQL, Mongoose y MongoDB Atlas.

Consulta la documentación completa de arquitectura, instalación, operaciones GraphQL y despliegue en Render en [ARCHITECTURE.md](ARCHITECTURE.md).

## Inicio rápido

```bash
npm install
copy .env.example .env
npm start
```

Configura `MONGODB_URI` en `.env` antes de iniciar. Endpoints:

- `GET /health`
- `POST /graphql`
- Apollo Sandbox: `http://localhost:4000/graphql`

## Servidor MCP

El proyecto incluye un servidor MCP oficial para Node.js que usa transporte `stdio` y consulta la API GraphQL desplegada en Render.

Configura `GRAPHQL_API_URL` en `.env` (por defecto apunta a `https://tadw-productosventas.onrender.com/graphql`) y ejecuta:

```bash
npm run mcp
```

Tools disponibles:

- `get_products`: obtiene todos los productos.
- `update_product`: recibe `id` y al menos uno de `price`, `stock` o `category`.

El proceso MCP reserva `stdout` para el protocolo; sus mensajes de diagnóstico se escriben en `stderr`.
