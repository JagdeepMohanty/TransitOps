import React from 'react';
import Card, { CardHeader } from '@/components/common/Card';

export default function FleetUtilizationChart({ utilization = 25, active = 1, total = 4 }) {
  const percentage = Math.min(Math.max(Number(utilization) || 0, 0), 100);

  return (
    <Card header={<CardHeader title="Fleet Utilization Rate" subtitle="Percentage of vehicles deployed on trips" />}>
      <div className="space-y-4 py-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">{percentage}%</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">({active} of {total} active)</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
            Target: 75%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Fleet</span>
            <span className="font-bold text-slate-800">{active} Trucks</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Standby / Available</span>
            <span className="font-bold text-slate-800">{Math.max(0, total - active)} Trucks</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

