const mongoose = require('mongoose');

async function connectDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI no está definida. Configúrala en el archivo .env.');
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB conectado: ${mongoose.connection.host}`);
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
