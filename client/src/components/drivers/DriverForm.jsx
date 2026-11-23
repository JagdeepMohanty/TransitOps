import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDriverSchema } from '@/schemas/driver.schema';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

const CATEGORIES = [
  { value: 'LMV', label: 'LMV (Light Motor Vehicle)' },
  { value: 'HTV', label: 'HTV (Heavy Transport Vehicle)' },
  { value: 'HMV', label: 'HMV (Heavy Motor Vehicle)' },
  { value: 'HGMV', label: 'HGMV (Heavy Goods Motor Vehicle)' },
];

export default function DriverForm({ initialData, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createDriverSchema),
    defaultValues: initialData || {
      name: '',
      licenseNumber: '',
      licenseCategory: 'HTV',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: 100,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="e.g. Ramesh Kumar"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="License Number"
          placeholder="e.g. DL0420240012345"
          error={errors.licenseNumber?.message}
          {...register('licenseNumber')}
        />
        <Select
          label="License Category"
          options={CATEGORIES}
          value={watch('licenseCategory')}
          onChange={(val) => setValue('licenseCategory', val)}
          error={errors.licenseCategory?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="License Expiry Date"
          type="date"
          error={errors.licenseExpiryDate?.message}
          {...register('licenseExpiryDate')}
        />
        <Input
          label="Contact Phone"
          placeholder="e.g. 9876543210"
          error={errors.contactNumber?.message}
          {...register('contactNumber')}
        />
      </div>

      <Input
        label="Initial Safety Score (0-100)"
        type="number"
        min="0"
        max="100"
        error={errors.safetyScore?.message}
        {...register('safetyScore')}
      />

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Driver' : 'Save Driver'}
        </Button>
      </div>
    </form>
  );
}

