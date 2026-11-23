import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMaintenanceSchema } from '@/schemas/maintenance.schema';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

const COMMON_TYPES = [
  { value: 'Oil Change', label: 'Oil Change' },
  { value: 'Tyre Replacement', label: 'Tyre Replacement' },
  { value: 'Brake Inspection', label: 'Brake Inspection' },
  { value: 'General Service', label: 'General Service' },
  { value: 'Engine Overhaul', label: 'Engine Overhaul' },
  { value: 'Battery Replacement', label: 'Battery Replacement' },
  { value: 'AC Service', label: 'AC Service' },
  { value: 'Pollution Certificate Check', label: 'Pollution Certificate Check' },
  { value: 'Other', label: 'Other Repairs' },
];

export default function MaintenanceForm({ vehicles = [], initialData, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: initialData || {
      vehicleId: '',
      maintenanceType: 'Oil Change',
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      cost: '',
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
        <Select
          label="Maintenance Category"
          options={COMMON_TYPES}
          value={watch('maintenanceType')}
          onChange={(val) => setValue('maintenanceType', val)}
          error={errors.maintenanceType?.message}
        />
        <Input
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />
      </div>

      <Input
        label="Estimated / Incurred Cost (₹)"
        type="number"
        step="0.01"
        placeholder="e.g. 3500"
        error={errors.cost?.message}
        {...register('cost')}
      />

      <div>
        <label className="label">
          Service Details & Symptoms
          <span className="label-hint">Required description</span>
        </label>
        <textarea
          className="input min-h-[80px]"
          placeholder="Describe issue or scheduled routine service..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Log Maintenance Work Order
        </Button>
      </div>
    </form>
  );
}

