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
