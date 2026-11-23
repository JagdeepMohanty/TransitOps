import React from 'react';
import { ConfirmModal } from '@/components/common/Modal';

export default function CancelTripModal({ open, isOpen, onClose, onConfirm, loading, error, trip }) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible || !trip) return null;

  return (
    <ConfirmModal
      open={isVisible}
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={loading}
      error={error}
      title="Cancel Freight Dispatch"
      message={`Are you sure you want to cancel Trip #${trip.id} (${trip.source || trip.origin} → ${trip.destination})? This will abort the assignment and restore vehicle ${trip.vehicle?.registrationNumber || ''} and driver status to AVAILABLE.`}
      confirmText="Cancel Trip"
      variant="danger"
    />
  );
}

