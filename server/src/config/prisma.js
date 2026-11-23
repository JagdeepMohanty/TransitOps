import './env.js';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

let prisma;
try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} catch (err) {
  console.error('❌  Failed to initialize PrismaClient:', err.message);
  console.error('    Ensure you have run "npm run prisma:generate" and DATABASE_URL is set in server/.env');
  throw err;
}

export default prisma;
