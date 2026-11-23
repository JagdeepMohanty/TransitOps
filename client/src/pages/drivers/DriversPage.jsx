import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Users, Edit2, Trash2, RefreshCw, Star, Phone, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell      from '@/components/layout/PageShell'
import Button         from '@/components/common/Button'
import SearchBar      from '@/components/common/SearchBar'
import FilterTabBar   from '@/components/common/FilterTabBar'
import StatusBadge    from '@/components/common/StatusBadge'
import Table          from '@/components/common/Table'
import StatsGrid      from '@/components/common/StatsGrid'
import PaginationBar  from '@/components/common/PaginationBar'
import { ConfirmModal } from '@/components/common/Modal'
import { driversApi } from '@/api/drivers.api'
import useDebounce    from '@/hooks/useDebounce'

const STATUS_TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'ON_TRIP',   label: 'On Trip'   },
  { key: 'OFF_DUTY',  label: 'Off Duty'  },
  { key: 'SUSPENDED', label: 'Suspended' },
]

const PAGE_SIZE = 10

function DriverAvatar({ name }) {
  const initials = (name || 'Driver').trim().split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'D'
  return (
    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 text-xs font-bold border border-slate-200">
      {initials}
    </div>
  )
}

function formatExpiry(val) {
  if (!val) return '—'
  const d = new Date(val)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DriversPage() {
  const [drivers,      setDrivers]      = useState([])
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 })
  const [search,       setSearch]       = useState('')
  const [activeTab,    setActiveTab]    = useState('all')
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // Deletion modal state
  const [deleteRow,    setDeleteRow]    = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError,  setDeleteError]  = useState(null)

  const debouncedSearch = useDebounce(search, 400)

  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (debouncedSearch) params.search = debouncedSearch
      if (activeTab !== 'all') params.status = activeTab
      const res = await driversApi.getAll(params)
      setDrivers(res.data.data.data ?? [])
      setPagination(res.data.data.pagination ?? { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeTab])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const handleDelete = async () => {
    if (!deleteRow) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await driversApi.remove(deleteRow.id)
      setDeleteRow(null)
      fetchDrivers()
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'Failed to delete driver')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Summary Metrics
  const stats = useMemo(() => {
    const safe = Array.isArray(drivers) ? drivers : []
    const available = safe.filter(d => d.status === 'AVAILABLE').length
    const onTrip    = safe.filter(d => d.status === 'ON_TRIP').length
    const offDuty   = safe.filter(d => d.status === 'OFF_DUTY').length
    return [
      { label: 'Licensed Personnel', value: pagination.total, sub: 'certified drivers' },
      { label: 'Available / Active', value: available, color: 'text-emerald-600', sub: 'ready for dispatch' },
      { label: 'In Transit',         value: onTrip,    color: 'text-blue-600', sub: 'on road' },
      { label: 'Off Duty / Leave',   value: offDuty,   color: 'text-slate-600', sub: 'unassigned' },
    ]
  }, [drivers, pagination.total])

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Driver Name',
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <DriverAvatar name={v} />
          <div>
            <span className="font-semibold text-slate-900 block truncate text-xs sm:text-sm">{v}</span>
            <span className="text-[11px] text-slate-500 font-mono block">ID #{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Dispatch Contact',
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
          <Phone size={12} className="text-slate-400" />
          <span>{v || '—'}</span>
        </div>
      ),
    },
    {
      key: 'licenseNumber',
      label: 'Commercial License',
      sortable: true,
      render: (v, row) => (
        <div>
          <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
            {v}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Exp: {formatExpiry(row.licenseExpiryDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'licenseCategory',
      label: 'Category',
      sortable: true,
      render: (v) => <span className="text-xs font-semibold text-slate-700">{v || '—'}</span>,
    },
    {
      key: 'safetyScore',
      label: 'Safety Score',
      sortable: true,
      align: 'center',
      render: (v) => {
        const score = v ?? 100
        const isGood = score >= 90
        const isFair = score >= 75
        return (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold">
            <Star size={12} className={isGood ? 'text-amber-500 fill-amber-500' : isFair ? 'text-blue-500 fill-blue-500' : 'text-slate-400'} />
            <span className={isGood ? 'text-amber-800' : isFair ? 'text-blue-800' : 'text-slate-700'}>{score}</span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <Link
            to={`/drivers/${row.id}/edit`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            title="Edit driver profile"
          >
            <Edit2 size={14} />
          </Link>
          <button
            onClick={() => { setDeleteError(null); setDeleteRow(row); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete driver record"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <PageShell
      title="Driver Registry"
      subtitle={`Commercial driver compliance & status tracking • ${pagination.total} total driver${pagination.total !== 1 ? 's' : ''}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={fetchDrivers}
            loading={loading}
          >
            Refresh
          </Button>
          <Link to="/drivers/add">
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />}>
              Add Driver
            </Button>
          </Link>
        </div>
      }
    >
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="xs" variant="secondary" onClick={fetchDrivers}>Retry</Button>
        </div>
      )}

      {/* Driver Stats */}
      <StatsGrid stats={stats} />

      {/* Table & Filter Container */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Status Tab Bar */}
        <div className="px-5 pt-3.5 pb-2.5 border-b border-slate-100 bg-slate-50/50">
          <FilterTabBar
            tabs={STATUS_TABS}
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPage(1); }}
            getCount={(key) => key === 'all' ? pagination.total : undefined}
          />
        </div>

        {/* Search */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <SearchBar
            placeholder="Search by driver name, license number, or phone…"
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            className="w-full sm:w-80"
          />
        </div>

        {/* Table */}
        <Table
          className="border-0 shadow-none rounded-none"
          columns={columns}
          data={drivers}
          loading={loading}
          emptyTitle="No drivers found"
          emptyDesc={search || activeTab !== 'all' ? 'Try adjusting your search query or status filter.' : 'Add your first driver to get started.'}
          emptyAction={
            !search && activeTab === 'all' && (
              <Link to="/drivers/add">
                <Button size="sm" leftIcon={<Plus size={14} />}>Add Driver</Button>
              </Link>
            )
          }
        />

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
          <PaginationBar
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteRow}
        onCancel={() => setDeleteRow(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Driver Record"
        message={`Are you sure you want to delete driver ${deleteRow?.name}? This action cannot be undone.`}
        confirmText="Delete Driver"
        variant="danger"
        error={deleteError}
      />
    </PageShell>
  )
}
