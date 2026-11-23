import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import Button from '@/components/common/Button';

export default function DashboardFilters({
  dateRange = 'all',
  onDateRangeChange,
  status = 'all',
  onStatusChange,
  onReset,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Filter size={14} className="text-slate-400" />
        <span>Filter Operations:</span>
      </div>

      <select
        value={dateRange}
        onChange={(e) => onDateRangeChange?.(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 outline-none focus:border-brand-500"
      >
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="all">All Time</option>
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 outline-none focus:border-brand-500"
      >
        <option value="all">All Fleets</option>
        <option value="active">Active Only</option>
        <option value="maintenance">In Maintenance</option>
      </select>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset filters"
        >
          <RotateCcw size={13} />
        </button>
      )}
    </div>
  );
}

