require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { connectDatabase, disconnectDatabase } = require('./db');

const port = Number(process.env.PORT) || 4000;
const host = '0.0.0.0';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
  });

  await apolloServer.start();

  app.get('/health', (_, response) => {
    const databaseIsReady = mongoose.connection.readyState === 1;
    response.status(databaseIsReady ? 200 : 503).json({
      status: databaseIsReady ? 'ok' : 'degraded',
      database: databaseIsReady ? 'connected' : 'disconnected',
    });
  });

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(apolloServer),
  );

  const server = httpServer.listen(port, host, () => {
    console.log(`API lista en http://localhost:${port}/graphql`);
    console.log(`Apollo Sandbox disponible en http://localhost:${port}/graphql`);
  });

  connectDatabase().catch((error) => {
    console.error('MongoDB no disponible:', error.message);
    console.error('Revisa la IP autorizada en MongoDB Atlas.');
  });

  const shutdown = async (signal) => {
    console.log(`${signal}: cerrando servidor...`);
    await apolloServer.stop();
    await disconnectDatabase();
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('No se pudo iniciar la aplicación:', error.message);
  process.exit(1);
});
