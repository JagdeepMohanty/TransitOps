import { z } from 'zod';
import { EXPENSE_TYPES } from '../constants/expenseTypes.js';

export const createExpenseSchema = z.object({
  vehicleId: z.number().int().positive(),
  tripId: z.number().int().positive().nullable().optional(),
  type: z.enum(Object.values(EXPENSE_TYPES)),
  amount: z.number().positive(),
  description: z.string().optional(),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
});

export const updateExpenseSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  tripId: z.number().int().positive().nullable().optional(),
  type: z.enum(Object.values(EXPENSE_TYPES)).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }).optional(),
});
