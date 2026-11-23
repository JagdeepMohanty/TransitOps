import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Route, Truck, Users, Activity, RefreshCw, AlertTriangle,
  ArrowUpRight, CheckCircle2, Clock, DollarSign, Fuel, Wrench,
  Filter, Calendar, ChevronDown, BarChart3, TrendingUp
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getKpis, getAnalyticsCharts } from '@/api/dashboard.api'
import { vehiclesApi } from '@/api/vehicles.api'
import { driversApi } from '@/api/drivers.api'
import KpiCard           from '@/components/dashboard/KpiCard'
import RecentTrips       from '@/components/dashboard/RecentTrips'
import Button            from '@/components/common/Button'
import { formatCurrency, formatNumber } from '@/utils'

const errMsg = (e) => e?.response?.data?.message ?? e?.message ?? 'Failed to load dashboard data.'

const STATUS_COLORS = {
  AVAILABLE:   '#22c55e',
  ON_TRIP:     '#2563eb',
  IN_SHOP:     '#f59e0b',
  RETIRED:     '#94a3b8',
  DRAFT:       '#f59e0b',
  DISPATCHED:  '#2563eb',
  COMPLETED:   '#22c55e',
  CANCELLED:   '#ef4444',
}

const TOOLTIP_STYLE = {
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: '12px',
}

export default function DashboardPage() {
  const navigate = useNavigate()

  // Data states
  const [kpis,      setKpis]      = useState(null)
  const [charts,    setCharts]    = useState(null)
  const [vehicles,  setVehicles]  = useState([])
  const [drivers,   setDrivers]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    type:      '',
    status:    '',
    driverId:  '',
    startDate: '',
    endDate:   '',
  })

  // Load resource options once
  useEffect(() => {
    Promise.all([
      vehiclesApi.getAll({ limit: 100 }),
      driversApi.getAll({ limit: 100 }),
    ]).then(([vRes, dRes]) => {
      setVehicles(vRes.data?.data?.data ?? [])
      setDrivers(dRes.data?.data?.data ?? [])
    }).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const activeFilters = {}
      if (filters.type)      activeFilters.type      = filters.type
      if (filters.status)    activeFilters.status    = filters.status
      if (filters.driverId)  activeFilters.driverId  = filters.driverId
      if (filters.startDate) activeFilters.startDate = filters.startDate
      if (filters.endDate)   activeFilters.endDate   = filters.endDate

      const [kpiRes, chartRes] = await Promise.all([
        getKpis(activeFilters),
        getAnalyticsCharts(activeFilters),
      ])
      setKpis(kpiRes.data?.data ?? {})
      setCharts(chartRes.data?.data ?? {})
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const pendingTrips = kpis?.pendingTrips ?? 0
  const inMaintenance = kpis?.vehiclesInMaintenance ?? 0

  return (
    <div className="page-container space-y-6">

      {/* ── Executive Command Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operations Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Operations Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live database analytics of commercial vehicles, freight transit, fuel efficiency, and compliance.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={fetchData}
            loading={loading}
          >
            Sync Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Route size={14} />}
            onClick={() => navigate('/trips/create')}
          >
            Dispatch Trip
          </Button>
        </div>
      </div>

      {/* ── Dashboard Filter Bar ── */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-600 mr-2">
          <Filter size={14} className="text-brand-600" />
          <span>Filters:</span>
        </div>

        {/* Vehicle Class */}
        <select
          value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-brand-500"
        >
          <option value="">All Vehicle Types</option>
          <option value="HEAVY">Heavy Commercial</option>
          <option value="MEDIUM">Medium Freight</option>
          <option value="LIGHT">Light Transit</option>
        </select>

        {/* Vehicle Status */}
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-brand-500"
        >
          <option value="">All Vehicle Statuses</option>
          <option value="AVAILABLE">Available / Ready</option>
          <option value="ON_TRIP">In Transit</option>
          <option value="IN_SHOP">In Maintenance Bay</option>
          <option value="RETIRED">Retired</option>
        </select>

        {/* Driver */}
        <select
          value={filters.driverId}
          onChange={e => setFilters(f => ({ ...f, driverId: e.target.value }))}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-brand-500"
        >
          <option value="">All Drivers</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Date Boundaries */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">From:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
            className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          />
          <span className="text-slate-400">To:</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
            className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          />
        </div>

        {(filters.type || filters.status || filters.driverId || filters.startDate || filters.endDate) && (
          <button
            onClick={() => setFilters({ type: '', status: '', driverId: '', startDate: '', endDate: '' })}
            className="text-xs font-semibold text-rose-600 hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="xs" variant="secondary" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {/* ── Operational Attention Bar ── */}
      {!loading && (pendingTrips > 0 || inMaintenance > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingTrips > 0 && (
            <div
              onClick={() => navigate('/trips')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    {pendingTrips} {pendingTrips === 1 ? 'Trip' : 'Trips'} in Draft / Pending Dispatch
                  </p>
                  <p className="text-[11px] text-amber-700">Awaiting vehicle assignment and driver release</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Review <ArrowUpRight size={13} />
              </span>
            </div>
          )}

          {inMaintenance > 0 && (
            <div
              onClick={() => navigate('/maintenance')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {inMaintenance} {inMaintenance === 1 ? 'Vehicle' : 'Vehicles'} Currently in Maintenance Bay
                  </p>
                  <p className="text-[11px] text-slate-500">Service logs open in workshop</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect <ArrowUpRight size={13} />
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Primary KPI Cards Grid (Real Database Calculations) ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-28">
              <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-2 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            primary
            title="Fleet Utilization"
            value={`${kpis?.fleetUtilization ?? 0}%`}
            subtitle={`${kpis?.vehiclesOnTrip ?? 0} active in use / ${kpis?.activeVehicles ?? 0} fleet`}
            icon={Activity}
          />
          <KpiCard
            title="Active Freight Trips"
            value={kpis?.activeTrips ?? 0}
            subtitle={`${kpis?.completedTrips ?? 0} completed • ${kpis?.pendingTrips ?? 0} draft`}
            icon={Route}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KpiCard
            title="Operational Fleet"
            value={`${kpis?.activeVehicles ?? 0} / ${kpis?.totalVehicles ?? 0}`}
            subtitle={`${kpis?.availableVehicles ?? 0} ready • ${kpis?.inactiveVehicles ?? 0} retired`}
            icon={Truck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <KpiCard
            title="Driver Availability"
            value={`${kpis?.availableDrivers ?? 0} / ${kpis?.totalDrivers ?? 0}`}
            subtitle={`${kpis?.driversOnDuty ?? 0} on duty/trip`}
            icon={Users}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>
      )}

      {/* ── Secondary Financial & Operational KPIs Row ── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Fuel Cost</span>
              <Fuel size={14} className="text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(kpis?.totalFuelCost ?? 0)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatNumber(kpis?.totalFuelLiters ?? 0)} Liters recorded</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Maintenance Cost</span>
              <Wrench size={14} className="text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(kpis?.totalMaintenanceCost ?? 0)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpis?.vehiclesInMaintenance ?? 0} vehicles in bay</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Other Expenses</span>
              <DollarSign size={14} className="text-purple-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(kpis?.totalExpenses ?? 0)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tolls, parking, and general</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Operational Spend</span>
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-brand-700 mt-1">{formatCurrency(kpis?.totalOperationalCost ?? 0)}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Sum of fuel, maintenance & expenses</p>
          </div>
        </div>
      )}

      {/* ── Visualizations Section (Database-Driven) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Expense & Operational Cost Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Operating Expenses</h3>
                <p className="text-[11px] text-slate-400">Fuel, maintenance and operational vouchers</p>
              </div>
            </div>
          </div>
          {charts?.monthlyTrends?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.monthlyTrends} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [formatCurrency(v)]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="fuelCost" fill="#2563eb" name="Fuel" stackId="a" radius={[0,0,0,0]} />
                <Bar dataKey="maintenanceCost" fill="#f59e0b" name="Maintenance" stackId="a" radius={[0,0,0,0]} />
                <Bar dataKey="expenseCost" fill="#a855f7" name="Other" stackId="a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              No monthly cost records found.
            </div>
          )}
        </div>

        {/* Monthly Trips Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Route size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Transit & Trips Volume</h3>
                <p className="text-[11px] text-slate-400">Total dispatches vs completed cargo shipments</p>
              </div>
            </div>
          </div>
          {charts?.monthlyTrends?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={2.5} name="Total Trips" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completedTrips" stroke="#10b981" strokeWidth={2.5} name="Completed Trips" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              No trip volume records found.
            </div>
          )}
        </div>
      </div>

      {/* ── Status Distributions Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Fleet Allocation Distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={15} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Fleet Status Breakdown</h3>
          </div>
          {charts?.fleetStatusDistribution?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={charts.fleetStatusDistribution}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {charts.fleetStatusDistribution.map(d => (
                    <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} vehicles`]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">No vehicle status data</div>
          )}
        </div>

        {/* Trip Status Distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Route size={15} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Trip Status Breakdown</h3>
          </div>
          {charts?.tripStatusDistribution?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={charts.tripStatusDistribution}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {charts.tripStatusDistribution.map(d => (
                    <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} trips`]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">No trip status data</div>
          )}
        </div>

        {/* Fuel Consumption Trend */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Fuel size={15} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Monthly Fuel Inflow</h3>
          </div>
          {charts?.monthlyTrends?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.monthlyTrends} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} Liters`]} />
                <Bar dataKey="fuelLiters" fill="#38bdf8" name="Volume (L)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">No fuel consumption data</div>
          )}
        </div>
      </div>

      {/* ── Vehicle-wise Expense Comparison ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-brand-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vehicle-Wise Cumulative Expense Comparison</h3>
            <p className="text-[11px] text-slate-400">Total operational spend by vehicle registration asset</p>
          </div>
        </div>
        {charts?.vehicleExpenseComparison?.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.vehicleExpenseComparison} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="vehicle" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [formatCurrency(v)]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="fuel" fill="#2563eb" name="Fuel Cost" stackId="a" />
              <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" stackId="a" />
              <Bar dataKey="other" fill="#94a3b8" name="Other Expenses" stackId="a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
            No vehicle expense comparison data available.
          </div>
        )}
      </div>

      {/* ── Recent Transit Dispatches ── */}
      <RecentTrips />
    </div>
  )
}
