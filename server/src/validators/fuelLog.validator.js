import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.number().int().positive(),
  tripId: z.number().int().positive().nullable().optional(),
  liters: z.number().positive(),
  cost: z.number().min(0),
  odometer: z.number().min(0).nullable().optional(),
  logDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
});

export const updateFuelLogSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  tripId: z.number().int().positive().nullable().optional(),
  liters: z.number().positive().optional(),
  cost: z.number().min(0).optional(),
  odometer: z.number().min(0).nullable().optional(),
  logDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }).optional(),
});
