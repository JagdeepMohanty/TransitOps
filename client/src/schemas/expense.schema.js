import { z } from 'zod';

export const EXPENSE_TYPES = ['FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'REPAIR', 'OTHER'];

export const createExpenseSchema = z.object({
  vehicleId:   z.coerce.number().int().positive('A valid vehicle must be selected'),
  type:        z.enum(EXPENSE_TYPES, { errorMap: () => ({ message: 'Please select a valid expense category' }) }),
  amount:      z.coerce.number().positive('Expense amount must be greater than 0'),
  expenseDate: z.string().min(1, 'Expense date is required').refine(v => !isNaN(Date.parse(v)), { message: 'Invalid expense date' }),
  description: z.string().optional().nullable(),
  tripId:      z.coerce.number().int().positive().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

