import React from 'react';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { User, Phone, ShieldCheck, Calendar, Award } from 'lucide-react';
import { formatDate } from '@/utils';

export default function DriverDetailsModal({ open, isOpen, onClose, driver }) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible || !driver) return null;

  return (
    <Modal open={isVisible} onClose={onClose} title={`Driver Details — ${driver.name}`}>
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{driver.name}</h3>
            <p className="text-xs text-slate-500 font-mono">Employee ID #{driver.id}</p>
          </div>
          <StatusBadge status={driver.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">License Number</span>
            <span className="font-mono font-semibold text-slate-800">{driver.licenseNumber}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">License Category</span>
            <span className="font-semibold text-slate-800">{driver.licenseCategory || 'HTV'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">License Expiration</span>
            <span className="font-mono text-slate-700">{formatDate(driver.licenseExpiryDate)}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Safety Score</span>
            <span className="font-bold text-amber-700">{driver.safetyScore ?? 100} / 100</span>
          </div>
        </div>

        <div className="p-3 border border-slate-200/90 rounded-lg text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Contact Phone:</span>
          <span className="font-mono font-semibold text-slate-800">{driver.phone || driver.contactNumber || '—'}</span>
        </div>
      </div>
    </Modal>
  );
}

