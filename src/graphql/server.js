const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { applyMiddleware } = require('graphql-middleware');
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { execute, subscribe } = require('graphql');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// Authentication middleware
const authMiddleware = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return { user };
    } catch (error) {
      return {};
    }
  }
  return {};
};

// Error handling middleware
const errorMiddleware = (error) => {
  console.error(error);
  return {
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
  };
};

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const context = await authMiddleware(req);
    return context;
  },
  formatError: errorMiddleware,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          },
        };
      },
    },
  ],
});

// Create Express app
const app = express();
app.use(express.json());

// Start server
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const httpServer = createServer(app);

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const subscriptionServer = useServer(
    {
      schema,
      execute,
      subscribe,
      onConnect: async (ctx) => {
        const token = ctx.connectionParams?.authorization?.split(' ')[1];
        if (token) {
          try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            return { user };
          } catch (error) {
            return {};
          }
        }
        return {};
      },
    },
    wsServer
  );

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
}); 