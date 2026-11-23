import { z } from 'zod';

export const TRIP_STATUS_VALUES = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

export const createTripSchema = z.object({
  source:          z.string().min(1, 'Origin / source is required').max(100),
  destination:     z.string().min(1, 'Destination is required').max(100),
  vehicleId:       z.coerce.number().int().positive('A valid vehicle must be selected'),
  driverId:        z.coerce.number().int().positive('A valid driver must be selected'),
  cargoWeight:     z.coerce.number().positive('Cargo weight must be greater than 0'),
  plannedDistance: z.coerce.number().positive('Planned distance must be greater than 0').optional().nullable(),
  revenue:         z.coerce.number().min(0, 'Revenue cannot be negative').optional().nullable(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  status: z.enum(TRIP_STATUS_VALUES).optional(),
});

export const completeTripSchema = z.object({
  endOdometer: z.coerce.number().positive('End odometer must be greater than 0').optional().nullable(),
});

