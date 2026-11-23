import React from 'react';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { formatNumber, formatCurrency } from '@/utils';
import { Truck, Scale, Gauge, MapPin } from 'lucide-react';

export default function VehicleDetailsModal({ open, isOpen, onClose, vehicle }) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible || !vehicle) return null;

  return (
    <Modal open={isVisible} onClose={onClose} title={`Vehicle Inventory — ${vehicle.registrationNumber}`}>
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{vehicle.name} {vehicle.model || ''}</h4>
            <span className="text-xs text-slate-500 font-mono">Reg: {vehicle.registrationNumber}</span>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Freight Class / Type</span>
            <span className="font-semibold text-slate-800">{vehicle.type}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Region</span>
            <span className="font-semibold text-slate-800">{vehicle.region || '—'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Payload Capacity</span>
            <span className="font-mono font-semibold text-slate-800">{formatNumber(vehicle.maxLoadCapacity)} kg</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Odometer</span>
            <span className="font-mono font-semibold text-slate-800">{formatNumber(vehicle.odometer)} km</span>
          </div>
        </div>

        <div className="p-3 border border-slate-200/90 rounded-lg text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Acquisition Cost:</span>
          <span className="font-mono font-bold text-slate-900">{formatCurrency(vehicle.acquisitionCost || 0)}</span>
        </div>
      </div>
    </Modal>
  );
}

