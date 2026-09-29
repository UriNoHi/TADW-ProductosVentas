const mongoose = require('mongoose');
const Product = require('./models/Product');

function toProduct(product) {
  if (!product) return null;

  return {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
    description: product.description || '',
  };
}

function buildProductFilter(filter = {}) {
  const query = {};

  if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
  if (filter.category) query.category = { $regex: filter.category, $options: 'i' };
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    query.price = {};
    if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
    if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
  }
  if (filter.minStock !== undefined) query.stock = { $gte: filter.minStock };
  if (filter.inStock === true) query.stock = { $gt: 0 };
  if (filter.inStock === false) query.stock = { $eq: 0 };

  return query;
}

const resolvers = {
  Query: {
    products: async (_, { filter }) => {
      const products = await Product.find(buildProductFilter(filter)).sort({ createdAt: -1 });
      return products.map(toProduct);
    },
    product: async (_, { id }) => {
      if (!mongoose.isValidObjectId(id)) return null;
      return toProduct(await Product.findById(id));
    },
  },
  Mutation: {
    updateProduct: async (_, { id, input }) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error('El id del producto no es válido.');
      }

      if (Object.keys(input).length === 0) {
        throw new Error('Debe enviar al menos un campo para actualizar.');
      }

      const product = await Product.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      });

      return toProduct(product);
    },
  },
};

module.exports = resolvers;
