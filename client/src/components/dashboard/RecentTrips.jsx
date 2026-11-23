import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Route, Clock, ArrowUpRight } from 'lucide-react'
import Table       from '@/components/common/Table'
import StatusBadge from '@/components/common/StatusBadge'
import Card        from '@/components/common/Card'
import { formatDate } from '@/utils'
import { tripsApi } from '@/api/trips.api'

const COLUMNS = [
  {
    key: 'id',
    label: 'Trip ID',
    sortable: true,
    render: (v) => <span className="font-mono font-semibold text-slate-800">#{v}</span>,
  },
  {
    key: 'route',
    label: 'Transit Corridor (Origin → Destination)',
    render: (_, row) => {
      const origin = row.source || row.origin || '—'
      const dest = row.destination || '—'
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{origin}</span>
          <span className="text-slate-400 font-mono text-xs">→</span>
          <span className="font-semibold text-slate-900">{dest}</span>
        </div>
      )
    },
  },
  {
    key: 'driver',
    label: 'Assigned Driver',
    render: (_, row) => (
      <span className="text-slate-700 text-xs">
        {row.driver?.name ?? (row.driver?.firstName ? `${row.driver.firstName} ${row.driver.lastName}` : '—')}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Dispatched Date',
    render: (v, row) => (
      <span className="text-slate-500 text-xs font-mono">
        {formatDate(row.createdAt || row.dispatchedAt || row.scheduledAt)}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (v) => <StatusBadge status={v} />,
  },
]

export default function RecentTrips() {
  const navigate = useNavigate()
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    tripsApi.list({ limit: 5, page: 1 })
      .then(res => {
        if (!cancelled) {
          const data = res.data?.data?.data ?? res.data?.data ?? []
          setTrips(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => {
        if (!cancelled) setTrips([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Route size={16} className="text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900">Recent Dispatches & Transit Movements</h3>
        </div>
        <Link
          to="/trips"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          View All Trips <ArrowRight size={13} />
        </Link>
      </div>

      <Table
        className="border-0 shadow-none rounded-none"
        columns={COLUMNS}
        data={trips}
        loading={loading}
        onRowClick={(row) => navigate(`/trips/${row.id}`)}
        emptyTitle="No recent trips"
        emptyDesc="Trips will appear here once scheduled or dispatched."
      />
    </div>
  )
}
