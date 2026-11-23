import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Edit2, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SYSTEM_ROLES = [
  { id: 1, name: 'FLEET_MANAGER',     label: 'Fleet Manager' },
  { id: 2, name: 'DISPATCHER',        label: 'Dispatcher' },
  { id: 3, name: 'SAFETY_OFFICER',    label: 'Safety Officer' },
  { id: 4, name: 'FINANCIAL_ANALYST', label: 'Financial Analyst' },
];

const EMPTY = { name: '', email: '', roleId: '1', password: '', confirm: '' };

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [/.{6,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const levels = [
    { label: 'Weak',   color: 'bg-rose-500',    text: 'text-rose-500'    },
    { label: 'Fair',   color: 'bg-amber-500',   text: 'text-amber-500'   },
    { label: 'Good',   color: 'bg-blue-500',    text: 'text-blue-500'    },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' },
  ];
  const lvl = levels[Math.max(0, score - 1)];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? lvl.color : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-[10px] font-bold ${lvl.text}`}>{lvl.label} password</p>
    </div>
  );
}

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const panel   = { hidden: { opacity: 0, scale: 0.95, y: 16 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }, exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.15 } } };

export default function UserModal({ mode, user, roles = [], onClose, onConfirm }) {
  const [form, setForm]     = useState(EMPTY);
  const [showPw, setShowPw] = useState(false);

  const availableRoles = roles.length > 0 ? roles : SYSTEM_ROLES;

  useEffect(() => {
    if (user && mode !== 'delete') {
      setForm({
        name:     user.name || '',
        email:    user.email || '',
        roleId:   String(user.roleId || user.role?.id || '1'),
        password: '',
        confirm:  '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [user, mode]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AnimatePresence>
      {mode && (
        <motion.div variants={overlay} initial="hidden" animate="show" exit="exit"
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs" onClick={onClose}>
          <motion.div variants={panel} initial="hidden" animate="show" exit="exit"
            className={`modal-panel bg-white rounded-2xl shadow-xl overflow-hidden ${mode === 'delete' ? 'max-w-md w-full' : 'max-w-lg w-full'}`}
            onClick={e => e.stopPropagation()}>

            {mode === 'delete' ? (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-900 text-sm">Delete System User</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 mb-4 text-xs text-rose-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">Permanent Deletion</p>
                      <p className="mt-0.5">Are you sure you want to remove <strong>{user?.name}</strong> ({user?.email}) from system access?</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                  <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={() => onConfirm(user)} className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Delete User</button>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${mode === 'edit' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {mode === 'edit' ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{mode === 'edit' ? 'Edit User' : 'Add New User'}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{mode === 'edit' ? 'Update account info and role' : 'Create a new database user account'}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="e.g. Vikram Sharma"
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        type="email"
                        placeholder="user@transitops.com"
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role *</label>
                      <select
                        value={form.roleId}
                        onChange={e => set('roleId', e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                      >
                        {availableRoles.map(r => (
                          <option key={r.id} value={r.id}>{r.name || r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password (add or optional update) */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {mode === 'edit' ? 'Change Password (leave blank to keep current)' : 'Password *'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={form.password}
                          onChange={e => set('password', e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {form.password && <PasswordStrength password={form.password} />}
                    </div>

                    {(mode !== 'edit' || form.password) && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                        <input
                          type="password"
                          value={form.confirm}
                          onChange={e => set('confirm', e.target.value)}
                          placeholder="••••••••"
                          className={`w-full h-9 px-3 text-xs border rounded-xl outline-none focus:ring-1 ${
                            form.confirm && form.confirm !== form.password
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
                          }`}
                        />
                        {form.confirm && form.confirm !== form.password && (
                          <p className="text-[11px] text-rose-600 mt-1">Passwords do not match</p>
                        )}
                        {form.confirm && form.confirm === form.password && form.confirm.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                  <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button
                    onClick={() => onConfirm(form)}
                    disabled={
                      !form.name ||
                      !form.email ||
                      (mode !== 'edit' && (!form.password || form.password !== form.confirm))
                    }
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
                  >
                    {mode === 'edit' ? 'Save Changes' : 'Create User'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
