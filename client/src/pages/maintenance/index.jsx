import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Wrench, Truck, Calendar, RefreshCw, CheckCircle, FileText, Trash2, Edit2 } from 'lucide-react'

import PageHeader    from '@/components/layout/PageHeader'
import Breadcrumb    from '@/components/common/Breadcrumb'
import Button        from '@/components/common/Button'
import SearchBar     from '@/components/common/SearchBar'
import Table         from '@/components/common/Table'
import StatusBadge   from '@/components/common/StatusBadge'
import Modal, { ConfirmModal } from '@/components/common/Modal'
import Loader        from '@/components/common/Loader'
import Card          from '@/components/common/Card'
import FilterTabBar  from '@/components/common/FilterTabBar'
import StatsGrid     from '@/components/common/StatsGrid'
import PaginationBar from '@/components/common/PaginationBar'
import { formatDate, formatCurrency } from '@/utils'
import { maintenanceApi } from '@/api/maintenance.api'
import { vehiclesApi    } from '@/api/vehicles.api'

const MAINTENANCE_TYPES = [
  'Oil Change', 'Tyre Replacement', 'Brake Inspection',
  'Pollution Certificate Check', 'General Service',
  'Engine Overhaul', 'Battery Replacement', 'AC Service', 'Annual Inspection',
]

const STATUS_TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'ACTIVE',    label: 'Active'    },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

const PAGE_SIZE = 10

const errMsg = (err) =>
  err?.response?.data?.message ?? err?.message ?? 'Something went wrong.'

const today = () => new Date().toISOString().slice(0, 10)

export default function MaintenancePage() {
  const [records,   setRecords]   = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [page,      setPage]      = useState(1)
  const [activeTab, setActiveTab] = useState('all')

  // Create modal
  const [showCreate,    setShowCreate]    = useState(false)
  const [vehicles,      setVehicles]      = useState([])
  const [loadingVeh,    setLoadingVeh]    = useState(false)
  const [createForm,    setCreateForm]    = useState({
    vehicleId: '', maintenanceType: '', description: '', startDate: today(), cost: '', notes: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError,   setCreateError]   = useState(null)

  // Edit modal
  const [editRow,       setEditRow]       = useState(null)
  const [editForm,      setEditForm]      = useState({
    maintenanceType: '', description: '', startDate: today(), cost: '', notes: '',
  })
  const [editLoading,   setEditLoading]   = useState(false)
  const [editError,     setEditError]     = useState(null)

  // Close modal
  const [closeRow,     setCloseRow]     = useState(null)
  const [closeForm,    setCloseForm]    = useState({ cost: '', notes: '' })
  const [closeLoading, setCloseLoading] = useState(false)
  const [closeError,   setCloseError]   = useState(null)

  // Delete modal
  const [deleteRow,    setDeleteRow]    = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch records
  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (activeTab !== 'all') params.status = activeTab
      const res = await maintenanceApi.list(params)
      const d   = res.data.data
      setRecords(d.data ?? [])
      setTotal(d.pagination?.total ?? 0)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }, [page, activeTab])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Load vehicles for create form
  const openCreate = async () => {
    setCreateError(null)
    setCreateForm({ vehicleId: '', maintenanceType: '', description: '', startDate: today(), cost: '', notes: '' })
    setShowCreate(true)
    setLoadingVeh(true)
    try {
      const res = await vehiclesApi.getAll({ limit: 100 })
      const list = (res.data.data?.data ?? []).filter(
        v => v.status !== 'RETIRED' && v.status !== 'ON_TRIP'
      )
      setVehicles(list)
    } catch {
      setCreateError('Failed to load vehicles.')
    } finally {
      setLoadingVeh(false)
    }
  }

  // Submit create
  const handleCreate = async () => {
    if (!createForm.vehicleId) {
      setCreateError('Select a vehicle.')
      return
    }
    if (!createForm.maintenanceType) {
      setCreateError('Select a maintenance type.')
      return
    }
    if (!createForm.startDate) {
      setCreateError('Start date is required.')
      return
    }

    setCreateLoading(true)
    setCreateError(null)
    try {
      await maintenanceApi.create({
        vehicleId:       parseInt(createForm.vehicleId),
        maintenanceType: createForm.maintenanceType,
        description:     createForm.description || undefined,
        startDate:       new Date(createForm.startDate).toISOString(),
        cost:            createForm.cost ? parseFloat(createForm.cost) : 0,
        notes:           createForm.notes || undefined,
      })
      setShowCreate(false)
      fetchRecords()
    } catch (err) {
      setCreateError(errMsg(err))
    } finally {
      setCreateLoading(false)
    }
  }

  // Open edit modal
  const openEdit = (row) => {
    setEditRow(row)
    setEditForm({
      maintenanceType: row.maintenanceType || '',
      description:     row.description || '',
      startDate:       row.startDate ? new Date(row.startDate).toISOString().slice(0, 10) : today(),
      cost:            row.cost != null ? String(row.cost) : '',
      notes:           row.notes || '',
    })
    setEditError(null)
  }

  // Submit edit
  const handleEdit = async () => {
    if (!editForm.maintenanceType) {
      setEditError('Select a maintenance type.')
      return
    }
    if (!editForm.startDate) {
      setEditError('Start date is required.')
      return
    }

    setEditLoading(true)
    setEditError(null)
    try {
      await maintenanceApi.update(editRow.id, {
        maintenanceType: editForm.maintenanceType,
        description:     editForm.description || undefined,
        startDate:       new Date(editForm.startDate).toISOString(),
        cost:            editForm.cost !== '' ? parseFloat(editForm.cost) : 0,
        notes:           editForm.notes || undefined,
      })
      setEditRow(null)
      fetchRecords()
    } catch (err) {
      setEditError(errMsg(err))
    } finally {
      setEditLoading(false)
    }
  }

  // Open close modal
  const openClose = (row) => {
    setCloseRow(row)
    setCloseForm({ cost: row.cost ? String(row.cost) : '', notes: '' })
    setCloseError(null)
  }

  // Submit close
  const handleClose = async () => {
    setCloseLoading(true)
    setCloseError(null)
    try {
      await maintenanceApi.close(closeRow.id, {
        cost:  closeForm.cost  ? parseFloat(closeForm.cost)  : undefined,
        notes: closeForm.notes || undefined,
      })
      setCloseRow(null)
      fetchRecords()
    } catch (err) {
      setCloseError(errMsg(err))
    } finally {
      setCloseLoading(false)
    }
  }

  // Submit delete
  const handleDelete = async () => {
    if (!deleteRow) return
    setDeleteLoading(true)
    try {
      await maintenanceApi.remove(deleteRow.id)
      setDeleteRow(null)
      fetchRecords()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  // Metrics
  const stats = useMemo(() => {
    const active    = records.filter(r => r.status === 'ACTIVE').length
    const completed = records.filter(r => r.status === 'COMPLETED').length
    const totalCost = records.reduce((s, r) => s + parseFloat(r.cost ?? 0), 0)
    return [
      { label: 'Total Records', value: total, sub: 'service entries' },
      { label: 'In Shop (Active)', value: active, color: active > 0 ? 'text-amber-600' : 'text-slate-600', sub: 'in bay currently' },
      { label: 'Completed',     value: completed, color: 'text-emerald-600', sub: 'certified roadworthy' },
      { label: 'Cumulative Cost', value: formatCurrency(totalCost), color: 'text-slate-900', sub: 'maintenance spend' },
    ]
  }, [records, total])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const columns = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      width: '60px',
      render: (v) => <span className="font-mono text-xs text-brand-600 font-semibold">#{v}</span>,
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Truck size={13} className="text-amber-600" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-slate-900">
              {row.vehicle?.registrationNumber ?? '—'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{row.vehicle?.name ?? ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'maintenanceType',
      label: 'Type',
      render: (v) => <span className="font-medium text-slate-800 text-sm">{v}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (v) => <span className="text-slate-500 text-sm truncate max-w-[200px] block">{v || '—'}</span>,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (v) => <span className="text-slate-500 text-xs">{formatDate(v)}</span>,
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (v) => (
        <span className="text-slate-500 text-xs">
          {v ? formatDate(v) : <span className="text-amber-600 font-medium">In progress</span>}
        </span>
      ),
    },
    {
      key: 'cost',
      label: 'Cost (₹)',
      align: 'right',
      render: (v) => (
        <span className="font-semibold text-slate-800 text-sm">
          {v != null ? formatCurrency(parseFloat(v)) : '—'}
        </span>
      ),
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => openEdit(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Edit maintenance record"
              >
                <Edit2 size={14} />
              </button>
              <Button
                size="xs"
                variant="success"
                leftIcon={<CheckCircle size={12} />}
                onClick={() => openClose(row)}
              >
                Close
              </Button>
            </>
          )}
          <button
            onClick={() => setDeleteRow(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete maintenance record"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <div className="page-container">
      <Breadcrumb />

      <PageHeader
        title="Fleet Maintenance"
        subtitle="Manage repair schedules, work orders, and vehicle shop logs"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchRecords}
              loading={loading}
            >
              Refresh
            </Button>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
              Log Maintenance
            </Button>
          </div>
        }
      />

      <StatsGrid stats={stats} />

      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-slate-100">
          <FilterTabBar
            tabs={STATUS_TABS}
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPage(1) }}
            getCount={(key) => key === 'all' ? total : undefined}
          />
        </div>

        {loading ? (
          <Loader variant="skeleton" lines={8} className="p-5" />
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchRecords}>Retry</Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={records}
            emptyTitle="No maintenance records found"
            emptyDesc={activeTab !== 'all' ? 'Try switching filter tabs.' : 'Schedule routine maintenance for your fleet.'}
            emptyAction={activeTab === 'all' && (
              <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>Log Maintenance</Button>
            )}
          />
        )}

        {!loading && !error && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            itemLabel="records"
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create Maintenance Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Log Maintenance"
        subtitle="Vehicle will be automatically set to IN_SHOP on creation."
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)} disabled={createLoading}>Cancel</Button>
            <Button size="sm" loading={createLoading} onClick={handleCreate}>Create Record</Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createError}</div>
          )}

          <MField label="Vehicle *">
            {loadingVeh ? (
              <div className="text-xs text-slate-500 py-2">Loading vehicles…</div>
            ) : (
              <select
                value={createForm.vehicleId}
                onChange={e => setCreateForm(f => ({ ...f, vehicleId: e.target.value }))}
                className={inputCls()}
              >
                <option value="">Select vehicle…</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.name} [{v.status}]
                  </option>
                ))}
              </select>
            )}
          </MField>

          <MField label="Maintenance Type *">
            <select
              value={createForm.maintenanceType}
              onChange={e => setCreateForm(f => ({ ...f, maintenanceType: e.target.value }))}
              className={inputCls()}
            >
              <option value="">Select type…</option>
              {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </MField>

          <MField label="Description">
            <input
              type="text"
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of work to be done"
              className={inputCls()}
            />
          </MField>

          <div className="grid grid-cols-2 gap-3">
            <MField label="Start Date *">
              <input
                type="date"
                value={createForm.startDate}
                onChange={e => setCreateForm(f => ({ ...f, startDate: e.target.value }))}
                className={inputCls()}
              />
            </MField>
            <MField label="Estimated Cost (₹)">
              <input
                type="number" min="0" step="0.01"
                value={createForm.cost}
                onChange={e => setCreateForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="0.00"
                className={inputCls()}
              />
            </MField>
          </div>

          <MField label="Notes">
            <textarea
              rows={2}
              value={createForm.notes}
              onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Additional service notes…"
              className={`${inputCls()} h-auto py-2 resize-none`}
            />
          </MField>
        </div>
      </Modal>

      {/* Edit Maintenance Modal */}
      <Modal
        isOpen={!!editRow}
        onClose={() => setEditRow(null)}
        title="Edit Maintenance Record"
        subtitle={`Record #${editRow?.id} — ${editRow?.vehicle?.registrationNumber ?? ''}`}
        size="md"
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

          <MField label="Maintenance Type *">
            <select
              value={editForm.maintenanceType}
              onChange={e => setEditForm(f => ({ ...f, maintenanceType: e.target.value }))}
              className={inputCls()}
            >
              <option value="">Select type…</option>
              {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </MField>

          <MField label="Description">
            <input
              type="text"
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of work to be done"
              className={inputCls()}
            />
          </MField>

          <div className="grid grid-cols-2 gap-3">
            <MField label="Start Date *">
              <input
                type="date"
                value={editForm.startDate}
                onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                className={inputCls()}
              />
            </MField>
            <MField label="Cost (₹)">
              <input
                type="number" min="0" step="0.01"
                value={editForm.cost}
                onChange={e => setEditForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="0.00"
                className={inputCls()}
              />
            </MField>
          </div>

          <MField label="Notes">
            <textarea
              rows={2}
              value={editForm.notes}
              onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Additional service notes…"
              className={`${inputCls()} h-auto py-2 resize-none`}
            />
          </MField>
        </div>
      </Modal>

      {/* Close Maintenance Modal */}
      <Modal
        isOpen={!!closeRow}
        onClose={() => setCloseRow(null)}
        title="Close Maintenance Record"
        subtitle={`${closeRow?.maintenanceType} — ${closeRow?.vehicle?.registrationNumber ?? ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCloseRow(null)} disabled={closeLoading}>Cancel</Button>
            <Button size="sm" variant="success" loading={closeLoading} onClick={handleClose}>Mark Completed</Button>
          </>
        }
      >
        <div className="space-y-4">
          {closeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{closeError}</div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            Closing this record will mark it <strong>COMPLETED</strong> and restore the vehicle to <strong>AVAILABLE</strong> status.
          </p>

          <MField label="Final Actual Cost (₹)">
            <input
              type="number" min="0" step="0.01"
              value={closeForm.cost}
              onChange={e => setCloseForm(f => ({ ...f, cost: e.target.value }))}
              placeholder="0.00"
              className={inputCls()}
            />
          </MField>

          <MField label="Closing Notes">
            <textarea
              rows={3}
              value={closeForm.notes}
              onChange={e => setCloseForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Work completed, parts replaced, next service due…"
              className={`${inputCls()} h-auto py-2 resize-none`}
            />
          </MField>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Maintenance Record"
        description={`Are you sure you want to delete maintenance record #${deleteRow?.id} (${deleteRow?.maintenanceType})? If active, the vehicle will be restored to Available.`}
        confirmLabel="Delete Record"
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

const inputCls = () =>
  'w-full h-9 px-3 text-sm border border-slate-200 rounded-xl outline-none transition bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500'
