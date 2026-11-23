import React from 'react';
import StatusBadge from '@/components/common/StatusBadge';
import { Route, Truck, User, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils';

export default function TripCard({ trip, onClick }) {
  if (!trip) return null;

  return (
    <div
      onClick={() => onClick?.(trip)}
      className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-card transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-slate-800">Trip #{trip.id}</span>
        <StatusBadge status={trip.status} size="sm" />
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-slate-900">{trip.source || trip.origin}</span>
        <span className="text-slate-400 font-mono">→</span>
        <span className="font-bold text-slate-900">{trip.destination}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle</span>
          <span className="font-mono font-medium text-slate-800 truncate block">
            {trip.vehicle?.registrationNumber || `ID #${trip.vehicleId}`}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Driver</span>
          <span className="font-medium text-slate-800 truncate block">
            {trip.driver?.name || `ID #${trip.driverId}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-medium">
        <span className="text-slate-500 font-mono">{formatDate(trip.createdAt || trip.dispatchedAt)}</span>
        <span className="font-bold text-slate-900">{trip.revenue ? formatCurrency(trip.revenue) : '—'}</span>
      </div>
    </div>
  );
}

