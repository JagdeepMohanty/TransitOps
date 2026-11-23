import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseSchema, EXPENSE_TYPES } from '@/schemas/expense.schema';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

export default function ExpenseForm({ vehicles = [], initialData, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: initialData || {
      vehicleId: '',
      type: 'FUEL',
      amount: '',
      expenseDate: new Date().toISOString().slice(0, 10),
      description: '',
    },
  });

  const vehicleOptions = vehicles.map(v => ({
    value: String(v.id),
    label: `${v.registrationNumber} — ${v.name || v.model || ''}`,
  }));

  const typeOptions = EXPENSE_TYPES.map(t => ({
    value: t,
    label: t.charAt(0) + t.slice(1).toLowerCase(),
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
          label="Expense Category"
          options={typeOptions}
          value={watch('type')}
          onChange={(val) => setValue('type', val)}
          error={errors.type?.message}
        />
        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          placeholder="e.g. 1500"
          error={errors.amount?.message}
          {...register('amount')}
        />
      </div>

      <Input
        label="Expense Date"
        type="date"
        error={errors.expenseDate?.message}
        {...register('expenseDate')}
      />

      <div>
        <label className="label">
          Description / Vendor Notes
          <span className="label-hint">Optional reference</span>
        </label>
        <textarea
          className="input min-h-[80px]"
          placeholder="e.g. NH48 toll booth receipt or oil replacement"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Record Expense
        </Button>
      </div>
    </form>
  );
}

