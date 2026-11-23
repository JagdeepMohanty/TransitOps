import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFuelLogSchema } from '@/schemas/fuelLog.schema';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

export default function FuelLogForm({ vehicles = [], initialData, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createFuelLogSchema),
    defaultValues: initialData || {
      vehicleId: '',
      liters: '',
      cost: '',
      odometer: '',
      logDate: new Date().toISOString().slice(0, 10),
    },
  });

  const vehicleOptions = vehicles.map(v => ({
    value: String(v.id),
    label: `${v.registrationNumber} — ${v.name || v.model || ''}`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Select Fleet Vehicle"
        options={vehicleOptions}
        value={String(watch('vehicleId'))}
        onChange={(val) => setValue('vehicleId', val)}
        error={errors.vehicleId?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Fuel Volume (Liters)"
          type="number"
          step="0.01"
          placeholder="e.g. 100"
          error={errors.liters?.message}
          {...register('liters')}
        />
        <Input
          label="Total Cost (₹)"
          type="number"
          step="0.01"
          placeholder="e.g. 10400"
          error={errors.cost?.message}
          {...register('cost')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Odometer Reading (km)"
          type="number"
          placeholder="e.g. 45000"
          error={errors.odometer?.message}
          {...register('odometer')}
        />
        <Input
          label="Refueling Date"
          type="date"
          error={errors.logDate?.message}
          {...register('logDate')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Save Fuel Log
        </Button>
      </div>
    </form>
  );
}

