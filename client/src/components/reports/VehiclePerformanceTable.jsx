import React from 'react';
import Table from '@/components/common/Table';
import { formatCurrency, formatNumber } from '@/utils';

const PERF_COLUMNS = [
  {
    key: 'registrationNumber',
    label: 'Vehicle',
    sortable: true,
    render: (v, row) => (
      <div>
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {v}
        </span>
        <p className="text-[11px] text-slate-400 mt-0.5">{row.vehicleName || row.name || ''}</p>
      </div>
    ),
  },
  {
    key: 'totalTrips',
    label: 'Trips',
    sortable: true,
    align: 'center',
    render: (v) => <span className="font-semibold text-slate-800 text-xs">{v ?? 0}</span>,
  },
  {
    key: 'totalDistance',
    label: 'Total Distance',
    sortable: true,
    align: 'right',
    render: (v) => <span className="text-slate-700 text-xs font-mono">{formatNumber(v ?? 0)} km</span>,
  },
  {
    key: 'totalFuelCost',
    label: 'Fuel Spend',
    sortable: true,
    align: 'right',
    render: (v) => <span className="font-medium text-blue-700 text-xs font-mono">{formatCurrency(v ?? 0)}</span>,
  },
  {
    key: 'totalMaintenanceCost',
    label: 'Maint. Spend',
    sortable: true,
    align: 'right',
    render: (v) => <span className="font-medium text-amber-700 text-xs font-mono">{formatCurrency(v ?? 0)}</span>,
  },
  {
    key: 'operationalCost',
    label: 'Total Op Cost',
    sortable: true,
    align: 'right',
    render: (v) => <span className="font-semibold text-slate-900 text-xs font-mono">{formatCurrency(v ?? 0)}</span>,
  },
  {
    key: 'totalRevenue',
    label: 'Revenue',
    sortable: true,
    align: 'right',
    render: (v) => <span className="font-bold text-emerald-700 text-xs font-mono">{formatCurrency(v ?? 0)}</span>,
  },
];

export default function VehiclePerformanceTable({ vehicles = [], loading = false }) {
  return (
    <Table
      columns={PERF_COLUMNS}
      data={vehicles}
      loading={loading}
      emptyTitle="No vehicle performance records"
      emptyDesc="Performance analytics will calculate once dispatches and fuel logs are recorded."
    />
  );
}

