import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.coerce.number().int().positive('A valid vehicle must be selected'),
  liters:    z.coerce.number().positive('Fuel volume in liters must be greater than 0'),
  cost:      z.coerce.number().positive('Fuel cost must be greater than 0'),
  logDate:   z.string().min(1, 'Log date is required').refine(v => !isNaN(Date.parse(v)), { message: 'Invalid log date' }),
  odometer:  z.coerce.number().min(0, 'Odometer reading cannot be negative').optional().nullable(),
  tripId:    z.coerce.number().int().positive().optional().nullable(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial();

