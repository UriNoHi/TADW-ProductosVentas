const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'https://tadw-productosventas.onrender.com/graphql';

async function requestGraphQL(query, variables = {}) {
  const response = await fetch(GRAPHQL_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  return payload.data;
}

async function getProducts() {
  const data = await requestGraphQL(`
    query GetProducts {
      products {
        id
        name
        price
        stock
        category
        description
      }
    }
  `);

  return data.products;
}

async function updateProduct({ id, price, stock, category }) {
  const data = await requestGraphQL(
    `
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
    `,
    {
      id,
      input: { price, stock, category },
    },
  );

  if (!data.updateProduct) {
    throw new Error(`No se encontró el producto con id "${id}".`);
  }

  return data.updateProduct;
}

module.exports = { getProducts, updateProduct };