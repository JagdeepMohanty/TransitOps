import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function CompleteTripModal({ open, isOpen, onClose, onConfirm, loading, error, trip }) {
  const isVisible = open ?? isOpen ?? false;
  const [endOdometer, setEndOdometer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.({
      endOdometer: endOdometer ? Number(endOdometer) : undefined,
    });
  };

  if (!isVisible || !trip) return null;

  return (
    <Modal open={isVisible} onClose={onClose} title={`Complete Trip #${trip.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-600">
          Completing this trip from <span className="font-semibold text-slate-800">{trip.source || trip.origin}</span> to{' '}
          <span className="font-semibold text-slate-800">{trip.destination}</span> will release assigned driver and vehicle back to AVAILABLE.
        </p>

        <Input
          label="Final Odometer Reading (km)"
          type="number"
          placeholder={trip.startOdometer ? `Reading above ${trip.startOdometer}` : 'e.g. 52400'}
          value={endOdometer}
          onChange={(e) => setEndOdometer(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Confirm Completion
          </Button>
        </div>
      </form>
    </Modal>
  );
}

