import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function CloseMaintenanceModal({ open, isOpen, onClose, onConfirm, loading, error, record }) {
  const isVisible = open ?? isOpen ?? false;
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.({
      cost: cost ? parseFloat(cost) : undefined,
      notes: notes || undefined,
    });
  };

  if (!isVisible || !record) return null;

  return (
    <Modal open={isVisible} onClose={onClose} title={`Close Work Order #${record.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-600">
          Completing this work order will mark the maintenance as COMPLETED and automatically return vehicle{' '}
          <span className="font-mono font-bold text-slate-800">{record.vehicle?.registrationNumber}</span> back to{' '}
          <span className="font-semibold text-emerald-700">AVAILABLE</span> status.
        </p>

        <Input
          label="Final Service / Repair Cost (₹)"
          type="number"
          step="0.01"
          placeholder="e.g. 4500"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />

        <div>
          <label className="label">
            Mechanic Resolution Notes
            <span className="label-hint">Optional remarks</span>
          </label>
          <textarea
            className="input min-h-[70px]"
            placeholder="e.g. Replaced front brake pads and checked fluid levels"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={loading}>
            Confirm & Complete Work Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}

