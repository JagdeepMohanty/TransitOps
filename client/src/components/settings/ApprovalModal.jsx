import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import Button from '@/components/common/Button';

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const panel   = { hidden: { opacity: 0, scale: 0.95, y: 16 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }, exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.15 } } };

const SYSTEM_ROLES = [
  { id: 1, name: 'FLEET_MANAGER',     label: 'Fleet Manager' },
  { id: 2, name: 'DISPATCHER',        label: 'Dispatcher' },
  { id: 3, name: 'SAFETY_OFFICER',    label: 'Safety Officer' },
  { id: 4, name: 'FINANCIAL_ANALYST', label: 'Financial Analyst' },
];

export default function ApprovalModal({
  isOpen,
  mode, // 'approve' | 'reject' | 'changeRole'
  user,
  roles = [],
  onClose,
  onConfirm,
  loading = false,
}) {
  const [selectedRoleId, setSelectedRoleId] = useState('2');
  const [reason, setReason]                 = useState('');

  const availableRoles = roles.length > 0 ? roles : SYSTEM_ROLES;

  useEffect(() => {
    if (user) {
      if (user.roleId) {
        setSelectedRoleId(String(user.roleId));
      } else if (user.requestedRole) {
        const found = availableRoles.find(
          r => r.name === user.requestedRole || r.label === user.requestedRole
        );
        setSelectedRoleId(String(found?.id || '2'));
      } else {
        setSelectedRoleId('2');
      }
      setReason('');
    }
  }, [user, availableRoles]);

  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    if (mode === 'approve') {
      onConfirm({ roleId: Number(selectedRoleId) });
    } else if (mode === 'reject') {
      onConfirm({ reason: reason.trim() || 'Registration rejected by administrator' });
    } else if (mode === 'changeRole') {
      onConfirm({ roleId: Number(selectedRoleId) });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlay}
        initial="hidden"
        animate="show"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${
                mode === 'approve'
                  ? 'bg-emerald-50 text-emerald-600'
                  : mode === 'reject'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {mode === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : mode === 'reject' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {mode === 'approve'
                    ? 'Approve User Registration'
                    : mode === 'reject'
                    ? 'Reject User Registration'
                    : 'Change User Role'}
                </h3>
                <p className="text-xs text-slate-500">
                  {user.name} ({user.email})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* User Details Callout */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Role:</span>
                <span className="font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {user.requestedRole || 'None specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className={`font-bold uppercase tracking-wider text-[10px] ${
                  user.approvalStatus === 'APPROVED'
                    ? 'text-emerald-600'
                    : user.approvalStatus === 'REJECTED'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                }`}>
                  {user.approvalStatus || 'PENDING'}
                </span>
              </div>
            </div>

            {mode === 'approve' || mode === 'changeRole' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {mode === 'approve' ? 'Assign Approved Role' : 'Select New Role'}
                </label>
                <select
                  value={selectedRoleId}
                  onChange={e => setSelectedRoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {availableRoles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {mode === 'approve'
                    ? 'This user will be activated immediately and granted access permissions corresponding to this role.'
                    : 'The user permissions will update immediately upon saving.'}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-bold">Access Rejection</p>
                    <p className="mt-0.5">
                      This user will be denied system login. Their record will be flagged as REJECTED.
                    </p>
                  </div>
                </div>

                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Unverified employee ID or unauthorized email domain"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <Button
              variant={mode === 'reject' ? 'danger' : 'primary'}
              size="sm"
              loading={loading}
              onClick={handleConfirm}
            >
              {mode === 'approve'
                ? 'Confirm & Approve Access'
                : mode === 'reject'
                ? 'Reject Registration'
                : 'Save Role Change'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
