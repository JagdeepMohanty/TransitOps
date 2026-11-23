import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTripSchema } from '@/schemas/trip.schema';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

export default function TripForm({ vehicles = [], drivers = [], initialData, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: initialData || {
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      plannedDistance: '',
      revenue: '',
    },
  });

  const vehicleOptions = vehicles.map(v => ({
    value: String(v.id),
    label: `${v.registrationNumber} — Cap: ${v.maxLoadCapacity} kg`,
  }));

  const driverOptions = drivers.map(d => ({
    value: String(d.id),
    label: `${d.name} (${d.licenseNumber})`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Origin / Source"
          placeholder="e.g. Surat Hub"
          error={errors.source?.message}
          {...register('source')}
        />
        <Input
          label="Destination"
          placeholder="e.g. Pune Depot"
          error={errors.destination?.message}
          {...register('destination')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Assign Vehicle"
          options={vehicleOptions}
          value={String(watch('vehicleId'))}
          onChange={(val) => setValue('vehicleId', val)}
          error={errors.vehicleId?.message}
        />
        <Select
          label="Assign Driver"
          options={driverOptions}
          value={String(watch('driverId'))}
          onChange={(val) => setValue('driverId', val)}
          error={errors.driverId?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Cargo Weight (kg)"
          type="number"
          placeholder="e.g. 12000"
          error={errors.cargoWeight?.message}
          {...register('cargoWeight')}
        />
        <Input
          label="Planned Distance (km)"
          type="number"
          placeholder="e.g. 410"
          error={errors.plannedDistance?.message}
          {...register('plannedDistance')}
        />
        <Input
          label="Freight Revenue (₹)"
          type="number"
          placeholder="e.g. 32000"
          error={errors.revenue?.message}
          {...register('revenue')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Create Freight Trip
        </Button>
      </div>
    </form>
  );
}

