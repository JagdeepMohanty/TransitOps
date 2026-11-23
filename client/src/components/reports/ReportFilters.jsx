import React from 'react';
import FilterTabBar from '@/components/common/FilterTabBar';

export default function ReportFilters({
  dateRange = 'all',
  onDateRangeChange,
  metric = 'all',
  onMetricChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeframe:</span>
      <select
        value={dateRange}
        onChange={(e) => onDateRangeChange?.(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 outline-none focus:border-brand-500"
      >
        <option value="month">Current Month</option>
        <option value="quarter">Last Quarter</option>
        <option value="year">Current Year</option>
        <option value="all">All Available Records</option>
      </select>
    </div>
  );
}

