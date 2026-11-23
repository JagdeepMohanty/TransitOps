import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Edit2, Trash2, UserCheck2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, UserPlus, RefreshCw,
  Clock, Shield, ShieldCheck, AlertCircle,
} from 'lucide-react';

const AVATAR_GRADIENTS = [
  'from-blue-500 to-violet-600',
  'from-emerald-500 to-cyan-500',
  'from-orange-500 to-rose-500',
  'from-violet-500 to-blue-500',
  'from-cyan-500 to-emerald-500',
  'from-rose-500 to-orange-500',
  'from-indigo-500 to-purple-600',
  'from-teal-500 to-blue-500',
];

const PAGE_SIZE = 8;

export default function UserManagementTable({
  users = [],
  roles = [],
  loading = false,
  error = null,
  onRefresh,
  onEdit,
  onDelete,
  onAdd,
  onApprove,
  onReject,
  onChangeRole,
}) {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [roleFilter, setRoleFilter]     = useState('all');
  const [sortKey, setSortKey]           = useState('createdAt');
  const [sortDir, setSortDir]           = useState('desc');
  const [page, setPage]                 = useState(1);

  // Counts
  const pendingCount  = useMemo(() => users.filter(u => u.approvalStatus === 'PENDING').length, [users]);
  const approvedCount = useMemo(() => users.filter(u => u.approvalStatus === 'APPROVED').length, [users]);
  const rejectedCount = useMemo(() => users.filter(u => u.approvalStatus === 'REJECTED').length, [users]);

  const filtered = useMemo(() => {
    let d = Array.isArray(users) ? users : [];

    // Filter by Approval Status
    if (statusFilter !== 'all') {
      d = d.filter(u => (u.approvalStatus || 'PENDING') === statusFilter);
    }

    // Filter by Search Query
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.requestedRole?.toLowerCase().includes(q)
      );
    }

    // Filter by Assigned Role
    if (roleFilter !== 'all') {
      d = d.filter(u => {
        const rName = u.role?.name || u.role;
        return rName === roleFilter;
      });
    }

    // Sort
    d = [...d].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return d;
  }, [users, search, statusFilter, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-content-disabled" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-bg-card/90 backdrop-blur-sm border border-border/60 rounded-2xl shadow-card-md overflow-hidden"
    >
      {/* ── Card Header ── */}
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-bg-card to-bg-card/80 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <UserCheck2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-content-primary">User Registration & Approvals</h3>
            <p className="text-xs text-content-muted">Manage user accounts, review pending signups, and grant RBAC access</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-500 animate-pulse">
              <Clock size={12} /> {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-[10px] font-black text-success">
            {approvedCount} Active Users
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl border border-border/60 text-content-muted hover:text-content-primary hover:bg-bg-base/60 transition-colors"
              title="Refresh users"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-[10px] font-black shadow-[0_0_16px_rgba(59,130,246,0.3)] hover:shadow-[0_0_24px_rgba(59,130,246,0.45)] transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Direct User
          </motion.button>
        </div>
      </div>

      {/* ── Status Tab Strip ── */}
      <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border/30 bg-bg-base/20 overflow-x-auto text-xs">
        <button
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-content-muted hover:text-content-primary hover:bg-bg-card'
          }`}
        >
          All Users ({users.length})
        </button>

        <button
          onClick={() => { setStatusFilter('PENDING'); setPage(1); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-500 hover:bg-amber-500/10'
          }`}
        >
          <Clock size={13} />
          Pending Approvals
          {pendingCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'PENDING' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setStatusFilter('APPROVED'); setPage(1); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-500 hover:bg-emerald-500/10'
          }`}
        >
          <CheckCircle2 size={13} />
          Approved ({approvedCount})
        </button>

        <button
          onClick={() => { setStatusFilter('REJECTED'); setPage(1); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-500 hover:bg-rose-500/10'
          }`}
        >
          <XCircle size={13} />
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* ── Search & Role Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 border-b border-border/40 bg-bg-base/30">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-content-disabled" />
          <input
            type="text"
            placeholder="Search by name, email, or requested role…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-bg-card border border-border/60 rounded-xl text-content-primary placeholder-content-disabled focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 text-xs bg-bg-card border border-border/60 rounded-xl text-content-primary focus:outline-none focus:border-primary/50 transition-all"
          >
            <option value="all">All Assigned Roles</option>
            <option value="FLEET_MANAGER">Fleet Manager</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="SAFETY_OFFICER">Safety Officer</option>
            <option value="FINANCIAL_ANALYST">Financial Analyst</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-bg-base/50 text-[10px] font-black text-content-disabled uppercase tracking-widest">
              <th className="px-5 py-3 cursor-pointer select-none" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1.5">User / Contact <SortIcon col="name" /></div>
              </th>
              <th className="px-5 py-3">Approval Status</th>
              <th className="px-5 py-3">Requested Role</th>
              <th className="px-5 py-3">Assigned Role</th>
              <th className="px-5 py-3 cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-1.5">Registration Date <SortIcon col="createdAt" /></div>
              </th>
              <th className="px-5 py-3 text-right">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-content-muted">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading database users…</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-rose-500">
                  {error}
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-content-muted">
                  No accounts found matching your selected filters.
                </td>
              </tr>
            ) : (
              paged.map((user, idx) => {
                const rName = user.role?.name || user.role || null;
                const status = user.approvalStatus || 'PENDING';

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-primary/[0.04] transition-colors duration-150 group"
                  >
                    {/* User Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} flex items-center justify-center shrink-0 shadow-sm`}>
                          <span className="text-xs font-black text-white">{getInitials(user.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-content-primary truncate group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-[11px] text-content-muted truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5">
                      {status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 size={11} /> APPROVED
                        </span>
                      ) : status === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <XCircle size={11} /> REJECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                          <Clock size={11} /> PENDING
                        </span>
                      )}
                    </td>

                    {/* Requested Role */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-content-muted">
                        {user.requestedRole || '—'}
                      </span>
                    </td>

                    {/* Assigned Role */}
                    <td className="px-5 py-3.5">
                      {rName ? (
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {rName}
                        </span>
                      ) : (
                        <span className="text-xs italic text-content-disabled">Unassigned</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-content-muted font-mono">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : '—'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => onApprove && onApprove(user)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                              title="Approve user registration"
                            >
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button
                              onClick={() => onReject && onReject(user)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[11px] transition-colors"
                              title="Reject registration"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        ) : status === 'REJECTED' ? (
                          <>
                            <button
                              onClick={() => onApprove && onApprove(user)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                              title="Re-evaluate & approve"
                            >
                              <CheckCircle2 size={12} /> Re-approve
                            </button>
                            <button
                              onClick={() => onDelete && onDelete(user)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-danger hover:bg-danger/10 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onChangeRole && onChangeRole(user)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] transition-colors"
                              title="Change user role"
                            >
                              <Shield size={12} /> Role
                            </button>
                            <button
                              onClick={() => onEdit && onEdit(user)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit user"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => onReject && onReject(user)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Revoke / Suspend access"
                            >
                              <XCircle size={13} />
                            </button>
                            <button
                              onClick={() => onDelete && onDelete(user)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-danger hover:bg-danger/10 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-bg-base/30 text-xs text-content-muted">
        <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-bg-card disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-content-primary">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-bg-card disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
