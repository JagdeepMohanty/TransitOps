import React from 'react';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate, formatCurrency, formatNumber } from '@/utils';
import { Route, Truck, User, Calendar, MapPin } from 'lucide-react';

export default function TripDetailsModal({ open, isOpen, onClose, trip }) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible || !trip) return null;

  return (
    <Modal open={isVisible} onClose={onClose} title={`Trip Details — #${trip.id}`}>
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              {trip.source || trip.origin} → {trip.destination}
            </h4>
            <span className="text-xs text-slate-500 font-mono">Trip Dispatch ID #{trip.id}</span>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Vehicle</span>
            <span className="font-mono font-semibold text-slate-900">
              {trip.vehicle?.registrationNumber || `ID #${trip.vehicleId}`}
            </span>
            <span className="text-slate-500 text-[11px] block">{trip.vehicle?.name || ''}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Driver</span>
            <span className="font-semibold text-slate-900">
              {trip.driver?.name || `ID #${trip.driverId}`}
            </span>
            <span className="text-slate-500 text-[11px] font-mono block">{trip.driver?.phone || ''}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cargo Payload</span>
            <span className="font-mono font-semibold text-slate-900">{formatNumber(trip.cargoWeight || 0)} kg</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Freight Revenue</span>
            <span className="font-bold text-emerald-700">
              {trip.revenue ? formatCurrency(trip.revenue) : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-slate-200/90 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Start Odometer</span>
            <span className="font-mono text-slate-800">{trip.startOdometer ? `${formatNumber(trip.startOdometer)} km` : '—'}</span>
          </div>
          <div className="p-3 border border-slate-200/90 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">End Odometer</span>
            <span className="font-mono text-slate-800">{trip.endOdometer ? `${formatNumber(trip.endOdometer)} km` : 'Pending'}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

