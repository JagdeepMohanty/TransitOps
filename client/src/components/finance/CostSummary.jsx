import React from 'react';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils';
import { DollarSign, Fuel, Wrench, Receipt } from 'lucide-react';

export default function CostSummary({
  totalCost = 0,
  fuelCost = 0,
  maintenanceCost = 0,
  otherCost = 0,
  className,
}) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className || ''}`}>
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Expense</span>
          <Receipt size={14} className="text-slate-400" />
        </div>
        <p className="text-xl font-bold tracking-tight text-slate-900">{formatCurrency(totalCost)}</p>
        <span className="text-[10px] text-slate-400 font-medium">cumulative spend</span>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-blue-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fuel Total</span>
          <Fuel size={14} />
        </div>
        <p className="text-xl font-bold tracking-tight text-blue-700">{formatCurrency(fuelCost)}</p>
        <span className="text-[10px] text-slate-400 font-medium">energy & diesel</span>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-amber-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Maintenance</span>
          <Wrench size={14} />
        </div>
        <p className="text-xl font-bold tracking-tight text-amber-700">{formatCurrency(maintenanceCost)}</p>
        <span className="text-[10px] text-slate-400 font-medium">repairs & service</span>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Other / Tolls</span>
          <DollarSign size={14} />
        </div>
        <p className="text-xl font-bold tracking-tight text-slate-800">{formatCurrency(otherCost)}</p>
        <span className="text-[10px] text-slate-400 font-medium">parking, permits & misc</span>
      </div>
    </div>
  );
}

