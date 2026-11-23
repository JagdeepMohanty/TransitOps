import React from 'react';
import { User, Phone, ShieldCheck, Star } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

export default function DriverCard({ driver, onClick }) {
  if (!driver) return null;
  const initials = (driver.name || 'Driver').trim().split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

  return (
    <div
      onClick={() => onClick?.(driver)}
      className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-card transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs border border-slate-200">
            {initials}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm leading-tight">{driver.name}</h4>
            <span className="text-[11px] text-slate-500 font-mono">ID #{driver.id}</span>
          </div>
        </div>
        <StatusBadge status={driver.status} size="sm" />
      </div>

      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">License:</span>
          <span className="font-mono text-slate-800">{driver.licenseNumber} ({driver.licenseCategory || 'HTV'})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Contact:</span>
          <span className="font-mono text-slate-700">{driver.phone || driver.contactNumber || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Safety Score:</span>
          <span className="font-semibold text-amber-700 flex items-center gap-1">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {driver.safetyScore ?? 100}
          </span>
        </div>
      </div>
    </div>
  );
}

