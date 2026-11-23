import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Fuel, Truck, Calendar, RefreshCw, Trash2, Edit2 } from 'lucide-react'

import PageHeader    from '@/components/layout/PageHeader'
import Breadcrumb    from '@/components/common/Breadcrumb'
import Button        from '@/components/common/Button'
import SearchBar     from '@/components/common/SearchBar'
import Table         from '@/components/common/Table'
import Modal, { ConfirmModal } from '@/components/common/Modal'
import Loader        from '@/components/common/Loader'
import Card          from '@/components/common/Card'
import StatsGrid     from '@/components/common/StatsGrid'
import PaginationBar from '@/components/common/PaginationBar'
import { formatDate, formatCurrency } from '@/utils'
import { fuelLogsApi } from '@/api/fuelLogs.api'
import { vehiclesApi } from '@/api/vehicles.api'

const PAGE_SIZE = 10
const errMsg = (e) => e?.response?.data?.message ?? e?.message ?? 'Something went wrong.'
const today  = () => new Date().toISOString().slice(0, 10)

export default function FuelPage() {
  const [logs,       setLogs]       = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')

  // Create modal
  const [showCreate,    setShowCreate]    = useState(false)
  const [vehicles,      setVehicles]      = useState([])
  const [loadingVeh,    setLoadingVeh]    = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError,   setCreateError]   = useState(null)
  const [form, setForm] = useState({
    vehicleId: '', liters: '', cost: '', logDate: today(), odometer: '', tripId: '',
  })

  // Edit modal
  const [editRow,       setEditRow]       = useState(null)
  const [editLoading,   setEditLoading]   = useState(false)
  const [editError,     setEditError]     = useState(null)
  const [editForm,      setEditForm]      = useState({
    vehicleId: '', liters: '', cost: '', logDate: today(), odometer: '', tripId: '',
  })

  // Delete modal
  const [deleteRow,     setDeleteRow]     = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteRow) return
    setDeleteLoading(true)
    try {
      await fuelLogsApi.remove(deleteRow.id)
      setDeleteRow(null)
      fetchLogs()
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setDeleteLoading(false)
    }
  }

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (search.trim()) params.search = search.trim()
      const res = await fuelLogsApi.list(params)
      const d   = res.data.data
      setLogs(d.data ?? [])
      setTotal(d.pagination?.total ?? 0)
    } catch (e) { setError(errMsg(e)) }
    finally     { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const stats = useMemo(() => {
    const totalLiters = logs.reduce((s, l) => s + parseFloat(l.liters ?? 0), 0)
    const totalCost   = logs.reduce((s, l) => s + parseFloat(l.cost   ?? 0), 0)
    return [
      { label: 'Total Logs',   value: total.toLocaleString('en-IN'),            color: 'text-slate-900' },
      { label: 'Total Liters', value: `${totalLiters.toLocaleString('en-IN')} L`, color: 'text-blue-600'  },
      { label: 'Total Cost',   value: formatCurrency(totalCost),                color: 'text-brand-600' },
      { label: 'Avg Cost/Log', value: logs.length ? formatCurrency(totalCost / logs.length) : '—', color: 'text-amber-600' },
    ]
  }, [logs, total])

  const openCreate = async () => {
    setCreateError(null)
    setForm({ vehicleId: '', liters: '', cost: '', logDate: today(), odometer: '', tripId: '' })
    setShowCreate(true)
    setLoadingVeh(true)
    try {
      const res = await vehiclesApi.getAll({ limit: 100 })
      setVehicles(res.data.data?.data ?? [])
    } catch { setCreateError('Failed to load vehicles.') }
    finally   { setLoadingVeh(false) }
  }

  const handleCreate = async () => {
    if (!form.vehicleId)                                  { setCreateError('Select a vehicle.'); return }
    if (!form.liters || parseFloat(form.liters) <= 0)     { setCreateError('Liters must be > 0.'); return }
    if (form.cost === '' || parseFloat(form.cost) < 0)    { setCreateError('Cost must be >= 0.'); return }
    if (!form.logDate)                                    { setCreateError('Log date is required.'); return }

    setCreateLoading(true)
    setCreateError(null)
    try {
      await fuelLogsApi.create({
        vehicleId: parseInt(form.vehicleId),
        liters:    parseFloat(form.liters),
        cost:      parseFloat(form.cost),
        logDate:   new Date(form.logDate).toISOString(),
        ...(form.odometer && { odometer: parseFloat(form.odometer) }),
        ...(form.tripId   && { tripId:   parseInt(form.tripId)     }),
      })
      setShowCreate(false)
      fetchLogs()
    } catch (e) { setCreateError(errMsg(e)) }
    finally     { setCreateLoading(false) }
  }

  const openEdit = async (row) => {
    setEditError(null)
    setEditRow(row)
    setEditForm({
      vehicleId: String(row.vehicleId ?? ''),
      liters:    row.liters ? String(row.liters) : '',
      cost:      row.cost != null ? String(row.cost) : '',
      logDate:   row.logDate ? new Date(row.logDate).toISOString().slice(0, 10) : today(),
      odometer:  row.odometer != null ? String(row.odometer) : '',
      tripId:    row.tripId ? String(row.tripId) : '',
    })
    setLoadingVeh(true)
    try {
      const res = await vehiclesApi.getAll({ limit: 100 })
      setVehicles(res.data.data?.data ?? [])
    } catch { setEditError('Failed to load vehicles.') }
    finally   { setLoadingVeh(false) }
  }

  const handleEdit = async () => {
    if (!editForm.vehicleId)                                  { setEditError('Select a vehicle.'); return }
    if (!editForm.liters || parseFloat(editForm.liters) <= 0) { setEditError('Liters must be > 0.'); return }
    if (editForm.cost === '' || parseFloat(editForm.cost) < 0) { setEditError('Cost must be >= 0.'); return }
    if (!editForm.logDate)                                    { setEditError('Log date is required.'); return }

    setEditLoading(true)
    setEditError(null)
    try {
      await fuelLogsApi.update(editRow.id, {
        vehicleId: parseInt(editForm.vehicleId),
        liters:    parseFloat(editForm.liters),
        cost:      parseFloat(editForm.cost),
        logDate:   new Date(editForm.logDate).toISOString(),
        odometer:  editForm.odometer ? parseFloat(editForm.odometer) : null,
        tripId:    editForm.tripId ? parseInt(editForm.tripId) : null,
      })
      setEditRow(null)
      fetchLogs()
    } catch (e) { setEditError(errMsg(e)) }
    finally     { setEditLoading(false) }
  }

  const COLUMNS = [
    { key: 'id', label: 'ID', width: '70px',
      render: (v) => <span className="font-mono text-xs text-brand-600 font-semibold">#{v}</span> },
    { key: 'vehicle', label: 'Vehicle',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Truck size={13} className="text-blue-600" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-slate-900">
              {row.vehicle?.registrationNumber ?? '—'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{row.vehicle?.name ?? ''}</p>
          </div>
        </div>
      )},
    { key: 'liters', label: 'Volume (L)', align: 'right',
      render: (v) => <span className="font-medium text-slate-800 font-mono">{parseFloat(v ?? 0).toLocaleString('en-IN')} L</span> },
    { key: 'cost', label: 'Cost (₹)', align: 'right',
      render: (v) => <span className="font-semibold text-slate-900">{formatCurrency(parseFloat(v ?? 0))}</span> },
    { key: 'odometer', label: 'Odometer', align: 'right',
      render: (v) => v
        ? <span className="text-sm text-slate-600 font-mono">{parseFloat(v).toLocaleString('en-IN')} km</span>
        : <span className="text-slate-400">—</span> },
    { key: 'logDate', label: 'Date',
      render: (v) => <span className="text-xs text-slate-500">{formatDate(v)}</span> },
    { key: 'trip', label: 'Linked Trip',
      render: (_, row) => row.trip
        ? <span className="font-mono text-xs text-brand-600">#{row.trip.id}</span>
        : <span className="text-slate-400 text-xs">—</span> },
    { key: 'actions', label: '', width: '80px', align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(row)}
            className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            title="Edit fuel log"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteRow(row)}
            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete fuel log"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )},
  ]

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="page-container">
      <Breadcrumb />

      <PageHeader
        title="Fuel Logs"
        subtitle="Track refueling records, cost efficiency, and consumption across all assets"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={fetchLogs} loading={loading}>
              Refresh
            </Button>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
              Log Fuel
            </Button>
          </div>
        }
      />

      <StatsGrid stats={stats} />

      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <SearchBar
            placeholder="Search vehicle…"
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            className="w-full sm:w-72"
          />
        </div>

        {loading ? (
          <Loader variant="skeleton" lines={8} className="p-5" />
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchLogs}>Retry</Button>
          </div>
        ) : (
          <Table
            columns={COLUMNS}
            data={logs}
            emptyTitle="No fuel logs found"
            emptyDesc={search ? 'Try clearing the search.' : 'Start logging fuel fills for your fleet.'}
            emptyAction={!search && <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>Log Fuel</Button>}
          />
        )}

        {!loading && !error && (
          <PaginationBar
            page={page} totalPages={totalPages} totalItems={total}
            pageSize={PAGE_SIZE} itemLabel="logs" onPageChange={setPage}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreate} onClose={() => setShowCreate(false)}
        title="Log Fuel Fill" size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)} disabled={createLoading}>Cancel</Button>
            <Button size="sm" loading={createLoading} onClick={handleCreate}>Save Log</Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createError}</div>
          )}

          <MField label="Vehicle *">
            {loadingVeh ? <p className="text-xs text-slate-500 py-2">Loading vehicles…</p> : (
              <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} className={iCls()}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                ))}
              </select>
            )}
          </MField>

          <div className="grid grid-cols-2 gap-3">
            <MField label="Liters *">
              <input type="number" min="0.1" step="0.1" value={form.liters}
                onChange={e => setForm(f => ({ ...f, liters: e.target.value }))}
                placeholder="e.g. 120" className={iCls()} />
            </MField>
            <MField label="Cost (₹) *">
              <input type="number" min="0" step="0.01" value={form.cost}
                onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="e.g. 10800" className={iCls()} />
            </MField>
            <MField label="Log Date *">
              <input type="date" value={form.logDate}
                onChange={e => setForm(f => ({ ...f, logDate: e.target.value }))}
                className={iCls()} />
            </MField>
            <MField label="Odometer (km)">
              <input type="number" min="0" step="1" value={form.odometer}
                onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))}
                placeholder="e.g. 48200" className={iCls()} />
            </MField>
          </div>

          <MField label="Trip ID (optional)">
            <input type="number" min="1" step="1" value={form.tripId}
              onChange={e => setForm(f => ({ ...f, tripId: e.target.value }))}
              placeholder="Link to a trip" className={iCls()} />
          </MField>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editRow} onClose={() => setEditRow(null)}
        title="Edit Fuel Fill" subtitle={`Log #${editRow?.id}`} size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditRow(null)} disabled={editLoading}>Cancel</Button>
            <Button size="sm" loading={editLoading} onClick={handleEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{editError}</div>
          )}

          <MField label="Vehicle *">
            {loadingVeh ? <p className="text-xs text-slate-500 py-2">Loading vehicles…</p> : (
              <select value={editForm.vehicleId} onChange={e => setEditForm(f => ({ ...f, vehicleId: e.target.value }))} className={iCls()}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                ))}
              </select>
            )}
          </MField>

          <div className="grid grid-cols-2 gap-3">
            <MField label="Liters *">
              <input type="number" min="0.1" step="0.1" value={editForm.liters}
                onChange={e => setEditForm(f => ({ ...f, liters: e.target.value }))}
                placeholder="e.g. 120" className={iCls()} />
            </MField>
            <MField label="Cost (₹) *">
              <input type="number" min="0" step="0.01" value={editForm.cost}
                onChange={e => setEditForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="e.g. 10800" className={iCls()} />
            </MField>
            <MField label="Log Date *">
              <input type="date" value={editForm.logDate}
                onChange={e => setEditForm(f => ({ ...f, logDate: e.target.value }))}
                className={iCls()} />
            </MField>
            <MField label="Odometer (km)">
              <input type="number" min="0" step="1" value={editForm.odometer}
                onChange={e => setEditForm(f => ({ ...f, odometer: e.target.value }))}
                placeholder="e.g. 48200" className={iCls()} />
            </MField>
          </div>

          <MField label="Trip ID (optional)">
            <input type="number" min="1" step="1" value={editForm.tripId}
              onChange={e => setEditForm(f => ({ ...f, tripId: e.target.value }))}
              placeholder="Link to a trip" className={iCls()} />
          </MField>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Fuel Log"
        description={`Are you sure you want to delete this fuel log of ${deleteRow?.liters}L (${formatCurrency(deleteRow?.cost)})? This action cannot be undone.`}
        confirmLabel="Delete Log"
      />
    </div>
  )
}

function MField({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

const iCls = () =>
  'w-full h-9 px-3 text-sm border border-slate-200 rounded-xl outline-none bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition'
