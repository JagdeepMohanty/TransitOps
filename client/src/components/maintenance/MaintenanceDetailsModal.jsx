import React from 'react';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate, formatCurrency } from '@/utils';
import { Truck, Calendar, Wrench, FileText } from 'lucide-react';

export default function MaintenanceDetailsModal({ open, isOpen, onClose, record }) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible || !record) return null;

  return (
    <Modal open={isVisible} onClose={onClose} title={`Work Order Details — #${record.id}`}>
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{record.maintenanceType}</h4>
            <span className="text-xs text-slate-500 font-mono">Work Order #{record.id}</span>
          </div>
          <StatusBadge status={record.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Vehicle</span>
            <span className="font-mono font-semibold text-slate-900">
              {record.vehicle?.registrationNumber || `ID #${record.vehicleId}`}
            </span>
            <span className="text-slate-500 text-[11px] block">{record.vehicle?.name || ''}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recorded Cost</span>
            <span className="font-semibold text-slate-900">
              {record.cost != null ? formatCurrency(parseFloat(record.cost)) : 'Pending'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Start Date</span>
            <span className="text-slate-700 font-mono">{formatDate(record.startDate)}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Completion Date</span>
            <span className="text-slate-700 font-mono">
              {record.endDate ? formatDate(record.endDate) : 'In progress'}
            </span>
          </div>
        </div>

        <div className="p-3 border border-slate-200/90 rounded-lg text-xs space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Issue Description & Notes</span>
          <p className="text-slate-800 leading-relaxed">{record.description || 'No description provided.'}</p>
        </div>
      </div>
    </Modal>
  );
}

