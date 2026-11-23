import { Router } from 'express';
import prisma from '../config/prisma.js';
import env from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import driverRoutes from './driver.routes.js';
import tripRoutes from './trip.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import fuelLogRoutes from './fuelLog.routes.js';
import expenseRoutes from './expense.routes.js';
import reportRoutes from './report.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

// Health check
router.get('/health', async (req, res) => {
  let dbStatus = 'unreachable';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unreachable';
  }

  const isHealthy = dbStatus === 'connected';
  const statusCode = isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

  res.status(statusCode).json({
    success: isHealthy,
    message: isHealthy ? 'TransitOps API is healthy' : 'TransitOps API is degraded: database is unreachable',
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    },
  });
});

// Module routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/fuel-logs', fuelLogRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

export default router;
