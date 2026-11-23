import env from './config/env.js';
import app from './app.js';
import prisma from './config/prisma.js';

let server;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅  Database connected');
  } catch (err) {
    console.error('⚠️   Database connection failed on startup:', err.message);
    console.warn('    Server will start in degraded mode. Endpoints requiring the database will return HTTP 503.');
  }

  server = app.listen(env.port, () => {
    console.log(`🚀  TransitOps API running`);
    console.log(`    Environment : ${env.nodeEnv}`);
    console.log(`    URL         : http://localhost:${env.port}`);
    console.log(`    Health      : http://localhost:${env.port}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌  Port ${env.port} is already in use by another process.`);
      console.error(`    Please free port ${env.port} or configure a different PORT in server/.env.`);
    } else {
      console.error('❌  Server error:', err.message);
    }
    process.exit(1);
  });
}

async function shutdown(signal) {
  console.log(`\n⚠️   ${signal} received — shutting down gracefully`);
  if (server) {
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('✅  Prisma disconnected. Goodbye.');
      } catch (err) {
        console.error('Error disconnecting Prisma:', err.message);
      }
      process.exit(0);
    });
  } else {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('❌  Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌  Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
