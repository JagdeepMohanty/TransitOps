import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Truck } from 'lucide-react'

const COLORS = {
  Available:   '#22c55e',
  'On Trip':   '#2563eb',
  Maintenance: '#f59e0b',
  Retired:     '#94a3b8',
}

export default function VehicleStatusChart({ kpis }) {
  const data = kpis ? [
    { name: 'Available',   value: Number(kpis.availableVehicles ?? 0),     color: COLORS['Available']   },
    { name: 'On Trip',     value: Number(kpis.vehiclesOnTrip ?? 0),        color: COLORS['On Trip']     },
    { name: 'Maintenance', value: Number(kpis.vehiclesInMaintenance ?? 0), color: COLORS['Maintenance'] },
  ].filter(d => d.value > 0) : []

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Truck size={15} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Fleet Allocation Status</h3>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-sm text-slate-400">
          {kpis ? 'No active vehicle data' : 'Loading fleet status…'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              formatter={(v) => [`${v} vehicles`]}
            />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
