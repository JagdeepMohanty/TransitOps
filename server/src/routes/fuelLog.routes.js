import { Router } from 'express';
import { getFuelLogs, getFuelLogById, createFuelLog, updateFuelLog, deleteFuelLog } from '../controllers/fuelLog.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createFuelLogSchema, updateFuelLogSchema } from '../validators/fuelLog.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getFuelLogs);
router.get('/:id', getFuelLogById);
router.post('/', authorize('DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), validate(createFuelLogSchema), createFuelLog);
router.put('/:id', authorize('DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), validate(updateFuelLogSchema), updateFuelLog);
router.delete('/:id', authorize('DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), deleteFuelLog);

export default router;
