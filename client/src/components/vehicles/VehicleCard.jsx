import React from 'react';
import StatusBadge from '@/components/common/StatusBadge';
import { Truck, Scale, Gauge, MapPin } from 'lucide-react';
import { formatNumber } from '@/utils';

export default function VehicleCard({ vehicle, onClick }) {
  if (!vehicle) return null;

  return (
    <div
      onClick={() => onClick?.(vehicle)}
      className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-card transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Truck size={15} />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 text-sm block">{vehicle.registrationNumber}</span>
            <span className="text-[11px] text-slate-400 block">{vehicle.name} {vehicle.model ? `• ${vehicle.model}` : ''}</span>
          </div>
        </div>
        <StatusBadge status={vehicle.status} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Freight Type</span>
          <span className="font-medium text-slate-800">{vehicle.type}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hub Region</span>
          <span className="font-medium text-slate-800">{vehicle.region || '—'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Capacity</span>
          <span className="font-mono text-slate-800">{formatNumber(vehicle.maxLoadCapacity)} kg</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Odometer</span>
          <span className="font-mono text-slate-800">{formatNumber(vehicle.odometer)} km</span>
        </div>
      </div>
    </div>
  );
}

