import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVehicleSchema } from '@/schemas/vehicle.schema';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

const VEHICLE_TYPES = [
  { value: 'Light Commercial Vehicle', label: 'Light Commercial Vehicle (LCV)' },
  { value: 'Medium Truck', label: 'Medium Duty Truck' },
  { value: 'Heavy Truck', label: 'Heavy Duty Freight Truck' },
  { value: 'Trailer', label: 'Multi-Axle Trailer' },
];

export default function VehicleForm({ initialData, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: initialData || {
      registrationNumber: '',
      name: '',
      model: '',
      type: 'Medium Truck',
      region: '',
      maxLoadCapacity: '',
      acquisitionCost: '',
      odometer: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Registration Number"
          placeholder="e.g. MH12AB1234"
          error={errors.registrationNumber?.message}
          {...register('registrationNumber')}
        />
        <Input
          label="Vehicle Manufacturer / Make"
          placeholder="e.g. Tata Motors"
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Model / Variant"
          placeholder="e.g. Prima 4028.S"
          error={errors.model?.message}
          {...register('model')}
        />
        <Select
          label="Freight Class / Type"
          options={VEHICLE_TYPES}
          value={watch('type')}
          onChange={(val) => setValue('type', val)}
          error={errors.type?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Hub Region"
          placeholder="e.g. Mumbai Hub"
          error={errors.region?.message}
          {...register('region')}
        />
        <Input
          label="Max Payload (kg)"
          type="number"
          placeholder="e.g. 15000"
          error={errors.maxLoadCapacity?.message}
          {...register('maxLoadCapacity')}
        />
        <Input
          label="Odometer (km)"
          type="number"
          placeholder="e.g. 25000"
          error={errors.odometer?.message}
          {...register('odometer')}
        />
      </div>

      <Input
        label="Acquisition Cost (₹)"
        type="number"
        step="0.01"
        placeholder="e.g. 2800000"
        error={errors.acquisitionCost?.message}
        {...register('acquisitionCost')}
      />

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Vehicle' : 'Register Vehicle'}
        </Button>
      </div>
    </form>
  );
}

