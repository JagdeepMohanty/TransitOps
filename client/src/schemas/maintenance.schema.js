import { z } from 'zod';

export const MAINTENANCE_STATUS_VALUES = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

export const createMaintenanceSchema = z.object({
  vehicleId:       z.coerce.number().int().positive('A valid vehicle must be selected'),
  maintenanceType: z.string().min(1, 'Maintenance type is required'),
  description:     z.string().min(1, 'Description is required'),
  startDate:       z.string().min(1, 'Start date is required').refine(v => !isNaN(Date.parse(v)), { message: 'Invalid start date' }),
  endDate:         z.string().optional().nullable().refine(v => !v || !isNaN(Date.parse(v)), { message: 'Invalid end date' }),
  cost:            z.coerce.number().min(0, 'Cost cannot be negative').optional().nullable(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial().extend({
  status: z.enum(MAINTENANCE_STATUS_VALUES).optional(),
});

export const closeMaintenanceSchema = z.object({
  cost:  z.coerce.number().min(0, 'Cost cannot be negative').optional().nullable(),
  notes: z.string().optional().nullable(),
});

