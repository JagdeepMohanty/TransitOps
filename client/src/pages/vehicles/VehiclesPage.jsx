import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Truck, Edit2, Trash2, RefreshCw, Activity, ShieldCheck } from 'lucide-react'
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
import { vehiclesApi } from '@/api/vehicles.api'
import useDebounce    from '@/hooks/useDebounce'
import { formatNumber } from '@/utils'

const STATUS_TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'ON_TRIP',   label: 'On Trip'   },
  { key: 'IN_SHOP',   label: 'In Shop'   },
  { key: 'RETIRED',   label: 'Retired'   },
]

const PAGE_SIZE = 10

export default function VehiclesPage() {
  const navigate = useNavigate()
  const [vehicles,     setVehicles]     = useState([])
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

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (debouncedSearch) params.search = debouncedSearch
      if (activeTab !== 'all') params.status = activeTab
      const res = await vehiclesApi.getAll(params)
      setVehicles(res.data.data.data ?? [])
      setPagination(res.data.data.pagination ?? { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeTab])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const handleDelete = async () => {
    if (!deleteRow) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await vehiclesApi.remove(deleteRow.id)
      setDeleteRow(null)
      fetchVehicles()
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'Failed to delete vehicle')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Summary Metrics
  const stats = useMemo(() => {
    const safe = Array.isArray(vehicles) ? vehicles : []
    const available = safe.filter(v => v.status === 'AVAILABLE').length
    const onTrip    = safe.filter(v => v.status === 'ON_TRIP').length
    const inShop    = safe.filter(v => v.status === 'IN_SHOP').length
    return [
      { label: 'Total Fleet',    value: pagination.total, sub: 'registered assets' },
      { label: 'Ready / Idle',   value: available, color: 'text-emerald-600', sub: 'ready for dispatch' },
      { label: 'In Transit',     value: onTrip,    color: 'text-blue-600', sub: 'active freight' },
      { label: 'In Workshop',    value: inShop,    color: inShop > 0 ? 'text-amber-600' : 'text-slate-600', sub: 'service bay' },
    ]
  }, [vehicles, pagination.total])

  const columns = useMemo(() => [
    {
      key: 'registrationNumber',
      label: 'Asset / Vehicle',
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Truck size={15} />
          </div>
          <div className="min-w-0">
            <span className="font-mono font-semibold text-slate-900 block truncate">{v}</span>
            <span className="text-xs text-slate-500 block truncate">{row.name}{row.model ? ` • ${row.model}` : ''}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Freight Class',
      sortable: true,
      render: (v) => <span className="text-xs font-medium text-slate-700">{v}</span>,
    },
    {
      key: 'region',
      label: 'Hub Region',
      sortable: true,
      render: (v) => <span className="text-xs text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'odometer',
      label: 'Odometer (Telemetry)',
      sortable: true,
      align: 'right',
      render: (v) => <span className="text-xs text-slate-800 font-mono">{formatNumber(v)} km</span>,
    },
    {
      key: 'maxLoadCapacity',
      label: 'Payload Cap.',
      sortable: true,
      align: 'right',
      render: (v) => <span className="text-xs text-slate-800 font-mono">{formatNumber(v)} kg</span>,
    },
    {
      key: 'status',
      label: 'Operational Status',
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
            to={`/vehicles/${row.id}/edit`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            title="Edit vehicle"
          >
            <Edit2 size={14} />
          </Link>
          <button
            onClick={() => { setDeleteError(null); setDeleteRow(row); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete vehicle"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <PageShell
      title="Fleet Vehicles"
      subtitle={`Comprehensive commercial inventory • ${pagination.total} total vehicle${pagination.total !== 1 ? 's' : ''}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={fetchVehicles}
            loading={loading}
          >
            Refresh
          </Button>
          <Link to="/vehicles/add">
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />}>
              Add Vehicle
            </Button>
          </Link>
        </div>
      }
    >
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="xs" variant="secondary" onClick={fetchVehicles}>Retry</Button>
        </div>
      )}

      {/* Fleet Metrics Overview */}
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
            placeholder="Search by registration, model, freight class, or region…"
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            className="w-full sm:w-80"
          />
        </div>

        {/* Table */}
        <Table
          className="border-0 shadow-none rounded-none"
          columns={columns}
          data={vehicles}
          loading={loading}
          emptyTitle="No vehicles found"
          emptyDesc={search || activeTab !== 'all' ? 'Try adjusting your search query or status filter.' : 'Add your first vehicle to get started.'}
          emptyAction={
            !search && activeTab === 'all' && (
              <Link to="/vehicles/add">
                <Button size="sm" leftIcon={<Plus size={14} />}>Add Vehicle</Button>
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
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteRow?.registrationNumber}? This will permanently remove it from the fleet inventory.`}
        confirmText="Delete Vehicle"
        variant="danger"
        error={deleteError}
      />
    </PageShell>
  )
}
