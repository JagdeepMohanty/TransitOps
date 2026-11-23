import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, MapPin, User, Truck, RefreshCw, CheckCircle, XCircle, Send, Trash2, ArrowRight, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import PageHeader     from '@/components/layout/PageHeader'
import Breadcrumb     from '@/components/common/Breadcrumb'
import Button         from '@/components/common/Button'
import SearchBar      from '@/components/common/SearchBar'
import Table          from '@/components/common/Table'
import StatusBadge    from '@/components/common/StatusBadge'
import Modal          from '@/components/common/Modal'
import { ConfirmModal } from '@/components/common/Modal'
import Loader         from '@/components/common/Loader'
import Card           from '@/components/common/Card'
import FilterTabBar   from '@/components/common/FilterTabBar'
import StatsGrid      from '@/components/common/StatsGrid'
import PaginationBar  from '@/components/common/PaginationBar'
import { formatDate, formatCurrency } from '@/utils'
import { tripsApi }   from '@/api/trips.api'

const STATUS_TABS = [
  { key: 'all',        label: 'All'        },
  { key: 'DRAFT',      label: 'Draft'      },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'COMPLETED',  label: 'Completed'  },
  { key: 'CANCELLED',  label: 'Cancelled'  },
]

const PAGE_SIZE = 10

const errMsg = (err) =>
  err?.response?.data?.message ?? err?.message ?? 'Something went wrong.'

export default function TripsPage() {
  const navigate = useNavigate()

  // Data state
  const [trips,     setTrips]     = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Filter / pagination state
  const [search,    setSearch]    = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [page,      setPage]      = useState(1)

  // Action modal state
  const [actionRow,    setActionRow]    = useState(null)
  const [actionType,   setActionType]   = useState(null)
  const [actionLoading,setActionLoading]= useState(false)
  const [actionError,  setActionError]  = useState(null)
  const [completeForm, setCompleteForm] = useState({ endOdometer: '' })

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (activeTab !== 'all') params.status = activeTab
      if (search.trim())       params.search = search.trim()

      const res = await tripsApi.list(params)
      const data = res.data?.data
      setTrips(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
      setTotal(data?.total ?? (Array.isArray(data?.data) ? data.data.length : 0))
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }, [page, activeTab, search])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  // Handlers for action executions
  const handleDispatch = async () => {
    if (!actionRow) return
    setActionLoading(true)
    setActionError(null)
    try {
      await tripsApi.dispatch(actionRow.id)
      setActionRow(null)
      setActionType(null)
      fetchTrips()
    } catch (err) {
      setActionError(errMsg(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!actionRow) return
    setActionLoading(true)
    setActionError(null)
    try {
      await tripsApi.cancel(actionRow.id)
      setActionRow(null)
      setActionType(null)
      fetchTrips()
    } catch (err) {
      setActionError(errMsg(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!actionRow) return
    setActionLoading(true)
    setActionError(null)
    try {
      await tripsApi.delete(actionRow.id)
      setActionRow(null)
      setActionType(null)
      fetchTrips()
    } catch (err) {
      setActionError(errMsg(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (e) => {
    e.preventDefault()
    if (!actionRow) return
    setActionLoading(true)
    setActionError(null)
    try {
      await tripsApi.complete(actionRow.id, {
        endOdometer: Number(completeForm.endOdometer) || undefined,
      })
      setActionRow(null)
      setActionType(null)
      setCompleteForm({ endOdometer: '' })
      fetchTrips()
    } catch (err) {
      setActionError(errMsg(err))
    } finally {
      setActionLoading(false)
    }
  }

  // Derived stats
  const stats = useMemo(() => {
    const safeTrips = Array.isArray(trips) ? trips : []
    const dispatched = safeTrips.filter(t => t.status === 'DISPATCHED').length
    const completed  = safeTrips.filter(t => t.status === 'COMPLETED').length
    const draft      = safeTrips.filter(t => t.status === 'DRAFT').length
    return [
      { label: 'Total In View',  value: safeTrips.length, sub: 'records' },
      { label: 'In Transit',     value: dispatched, color: 'text-blue-600', sub: 'active dispatches' },
      { label: 'Completed',      value: completed,  color: 'text-emerald-600', sub: 'fulfilled' },
      { label: 'Draft / Plan',   value: draft,      color: 'text-slate-600', sub: 'pending release' },
    ]
  }, [trips])

  const columns = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (v) => <span className="font-mono font-semibold text-slate-800">#{v}</span>,
    },
    {
      key: 'route',
      label: 'Transit Corridor (Origin → Destination)',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{row.source || row.origin || '—'}</span>
          <span className="text-slate-400 font-mono text-xs">→</span>
          <span className="font-semibold text-slate-900">{row.destination || '—'}</span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle Assigned',
      render: (_, row) => {
        const v = row.vehicle
        if (!v) return <span className="text-slate-400">—</span>
        return (
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-slate-400 shrink-0" />
            <div>
              <span className="font-mono text-xs font-semibold text-slate-800 block">{v.registrationNumber}</span>
              <span className="text-[11px] text-slate-500 block truncate">{v.name || v.model || ''}</span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'driver',
      label: 'Assigned Driver',
      render: (_, row) => {
        const d = row.driver
        if (!d) return <span className="text-slate-400">—</span>
        const dName = d.name ?? (d.firstName ? `${d.firstName} ${d.lastName}` : '—')
        return (
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-700">{dName}</span>
          </div>
        )
      },
    },
    {
      key: 'distance',
      label: 'Distance',
      align: 'right',
      render: (v) => <span className="text-xs font-mono text-slate-700">{v ? `${v} km` : '—'}</span>,
    },
    {
      key: 'revenue',
      label: 'Freight Fee',
      align: 'right',
      render: (v) => <span className="text-xs font-semibold text-slate-900">{v ? formatCurrency(v) : '—'}</span>,
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
          {row.status === 'DRAFT' && (
            <>
              <button
                onClick={() => { setActionRow(row); setActionType('dispatch'); setActionError(null); }}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                title="Dispatch trip"
              >
                <Send size={14} />
              </button>
              <button
                onClick={() => navigate(`/trips/${row.id}/edit`)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Edit draft trip"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => { setActionRow(row); setActionType('delete'); setActionError(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete draft trip"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          {row.status === 'DISPATCHED' && (
            <>
              <button
                onClick={() => {
                  setActionRow(row)
                  setActionType('complete')
                  setActionError(null)
                  setCompleteForm({ endOdometer: row.startOdometer ? String(row.startOdometer + 100) : '' })
                }}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Mark as completed"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => { setActionRow(row); setActionType('cancel'); setActionError(null); }}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                title="Cancel trip"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ], [])

  return (
    <div className="page-container space-y-5">
      <Breadcrumb />

      <PageHeader
        title="Trips & Dispatch Console"
        subtitle="Schedule freight movements, dispatch drivers, and log telemetry completion"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={13} />}
              onClick={fetchTrips}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => navigate('/trips/create')}
            >
              Create Trip
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="xs" variant="secondary" onClick={fetchTrips}>Retry</Button>
        </div>
      )}

      {/* Stats Row */}
      <StatsGrid stats={stats} />

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Status Tab Bar */}
        <div className="px-5 pt-3.5 pb-2.5 border-b border-slate-100 bg-slate-50/50">
          <FilterTabBar
            tabs={STATUS_TABS}
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPage(1); }}
            getCount={(key) => key === 'all' ? total : undefined}
          />
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <SearchBar
            placeholder="Search by origin, destination, or corridor…"
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            className="w-full sm:w-80"
          />
        </div>

        {/* Data Table */}
        <Table
          className="border-0 shadow-none rounded-none"
          columns={columns}
          data={trips}
          loading={loading}
          onRowClick={(row) => navigate(`/trips/${row.id}`)}
          emptyTitle="No trips found"
          emptyDesc="No dispatches match the selected filter criteria."
        />

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
          <PaginationBar
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            onPageChange={setPage}
            totalItems={total}
            pageSize={PAGE_SIZE}
          />
        </div>
      </div>

      {/* ── Dispatch Confirm Modal ── */}
      <ConfirmModal
        open={actionType === 'dispatch' && !!actionRow}
        title="Confirm Dispatch"
        message={`Are you sure you want to dispatch Trip #${actionRow?.id} from ${actionRow?.source || actionRow?.origin} to ${actionRow?.destination}? This will update the assigned vehicle status to ON_TRIP.`}
        confirmText="Dispatch Now"
        variant="primary"
        loading={actionLoading}
        error={actionError}
        onConfirm={handleDispatch}
        onCancel={() => { setActionRow(null); setActionType(null); }}
      />

      {/* ── Cancel Confirm Modal ── */}
      <ConfirmModal
        open={actionType === 'cancel' && !!actionRow}
        title="Cancel Trip"
        message={`Are you sure you want to cancel Trip #${actionRow?.id}? The vehicle and driver will be released back to AVAILABLE.`}
        confirmText="Cancel Trip"
        variant="danger"
        loading={actionLoading}
        error={actionError}
        onConfirm={handleCancel}
        onCancel={() => { setActionRow(null); setActionType(null); }}
      />

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        open={actionType === 'delete' && !!actionRow}
        title="Delete Draft Trip"
        message={`Are you sure you want to delete draft Trip #${actionRow?.id}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={actionLoading}
        error={actionError}
        onConfirm={handleDelete}
        onCancel={() => { setActionRow(null); setActionType(null); }}
      />

      {/* ── Complete Trip Modal ── */}
      <Modal
        open={actionType === 'complete' && !!actionRow}
        onClose={() => { setActionRow(null); setActionType(null); }}
        title={`Complete Trip #${actionRow?.id}`}
      >
        <form onSubmit={handleComplete} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {actionError}
            </div>
          )}

          <p className="text-xs text-slate-600">
            Completing this trip will release the vehicle and driver back to AVAILABLE, and calculate distance traveled.
          </p>

          <div>
            <label className="label">
              Ending Odometer (km)
              <span className="label-hint">Optional final reading</span>
            </label>
            <input
              type="number"
              className="input"
              placeholder={actionRow?.startOdometer ? `Higher than ${actionRow.startOdometer}` : 'e.g. 48500'}
              value={completeForm.endOdometer}
              onChange={(e) => setCompleteForm({ endOdometer: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setActionRow(null); setActionType(null); }}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
            >
              Complete Trip
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
