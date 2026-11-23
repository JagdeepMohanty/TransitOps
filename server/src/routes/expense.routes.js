import { Router } from 'express';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expense.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', authorize('DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), validate(createExpenseSchema), createExpense);
router.put('/:id', authorize('DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), validate(updateExpenseSchema), updateExpense);
router.delete('/:id', authorize('DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), deleteExpense);

export default router;
