import { UserCircle, Mail, Shield, Lock, Clock, Route, Truck, Star, Briefcase, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageShell from '@/components/layout/PageShell';
import Card from '@/components/common/Card';

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm text-slate-800 font-medium ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className={`p-1.5 rounded-lg ${color}`}><Icon className="w-3.5 h-3.5" /></div>
      <p className="text-base font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400 text-center font-medium">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const initials = (user?.name ?? 'Admin User').trim().split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'AU';
  const role     = user?.role?.name ?? user?.role ?? 'Fleet Manager';

  return (
    <PageShell
      title="User Profile"
      subtitle="Account credentials, assigned organizational role, and access overview"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl">

        {/* User Card */}
        <Card padding="none" className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-brand-100 shadow-md">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name ?? 'TransitOps User'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email ?? 'user@transitops.com'}</p>
            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                {role}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
            <StatPill icon={Route} label="Trips"    value="Active"  color="bg-brand-50 text-brand-600" />
            <StatPill icon={Truck} label="Fleet"    value="Managed" color="bg-emerald-50 text-emerald-600" />
            <StatPill icon={Star}  label="Security" value="Verified" color="bg-amber-50 text-amber-600" />
          </div>

          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Session
            </span>
          </div>
        </Card>

        {/* Account Details Card */}
        <Card padding="none" className="lg:col-span-2">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <UserCircle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personnel & Organizational Details</h2>
              <p className="text-xs text-slate-500">Verified profile attributes from backend user directory</p>
            </div>
          </div>
          <div className="px-6 py-2 divide-y divide-slate-100">
            <InfoRow label="Full Name"     value={user?.name ?? 'TransitOps User'} />
            <InfoRow label="Email Address" value={user?.email ?? 'user@transitops.com'} />
            <InfoRow label="System Role"   value={role} />
            <InfoRow label="Department"    value="Transportation & Fleet Operations" />
            <InfoRow label="User ID"       value={`USR-${user?.id ?? 1}`} mono />
            <InfoRow label="Access Scope"  value="Full Operations & Reporting" />
            <InfoRow label="Session Type"  value="JWT Authenticated (24h validity)" />
          </div>
        </Card>

        {/* Security Overview */}
        <Card padding="none" className="lg:col-span-3">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Security & Session Overview</h2>
              <p className="text-xs text-slate-500">Authentication standards and credential storage status</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { icon: Lock,   label: 'Password Storage', value: 'Bcrypt Hashed (Salt 10)', sub: 'Never exposed in API or token', color: 'bg-brand-50 text-brand-600' },
              { icon: Shield, label: 'Authorization',    value: 'Role-Based Access Control', sub: 'Validated by server middleware', color: 'bg-amber-50 text-amber-600' },
              { icon: Clock,  label: 'Token Refresh',    value: 'Active Session',            sub: 'Automatic expiry on 401 response', color: 'bg-emerald-50 text-emerald-600' },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="flex items-start gap-3.5 p-6">
                <div className={`p-2.5 rounded-xl shrink-0 ${color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PageShell>
  );
}
