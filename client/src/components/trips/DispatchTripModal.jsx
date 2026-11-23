import React from 'react';
import { ConfirmModal } from '@/components/common/Modal';

export default function DispatchTripModal({ open, isOpen, onClose, onConfirm, loading, error, trip }) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible || !trip) return null;

  return (
    <ConfirmModal
      open={isVisible}
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={loading}
      error={error}
      title="Dispatch Commercial Freight"
      message={`Are you ready to dispatch Trip #${trip.id} from ${trip.source || trip.origin} to ${trip.destination}? This will mark the vehicle and driver status as ON_TRIP and log starting odometer ${trip.vehicle?.odometer || 0} km.`}
      confirmText="Dispatch Now"
      variant="primary"
    />
  );
}

