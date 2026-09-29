require('dotenv').config();

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { getProducts, updateProduct } = require('./graphql-client');

const server = new McpServer({
  name: 'productos-ventas-mcp',
  version: '1.0.0',
});

function toolResult(value) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2),
      },
    ],
    structuredContent: { result: value },
  };
}

server.registerTool(
  'get_products',
  {
    description: 'Obtiene el listado completo de productos desde la API GraphQL de Productos Ventas.',
  },
  async () => toolResult(await getProducts()),
);

server.registerTool(
  'update_product',
  {
    description: 'Actualiza el precio, stock o categoría de un producto por su ID.',
    inputSchema: {
      id: z.string().min(1).describe('ID del producto que se actualizará'),
      price: z.number().nonnegative().optional().describe('Nuevo precio del producto'),
      stock: z.number().int().nonnegative().optional().describe('Nuevo stock del producto'),
      category: z.string().min(1).optional().describe('Nueva categoría del producto'),
    },
  },
  async ({ id, price, stock, category }) => {
    if (price === undefined && stock === undefined && category === undefined) {
      throw new Error('Debe proporcionar al menos uno de estos campos: price, stock o category.');
    }

    return toolResult(await updateProduct({ id, price, stock, category }));
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Servidor MCP de Productos Ventas conectado por stdio.');
}

main().catch((error) => {
  console.error('No se pudo iniciar el servidor MCP:', error);
  process.exit(1);
});