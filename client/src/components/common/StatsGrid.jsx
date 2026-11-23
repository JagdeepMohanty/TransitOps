import Card from './Card'

/**
 * StatsGrid — renders an enterprise responsive grid of stat cards.
 * Eliminates repetitive cards and creates consistent metric display.
 *
 * @prop {Array} stats — [{ label: string, value: string|number, color: string, sub?: string }]
 */
export default function StatsGrid({ stats }) {
  if (!Array.isArray(stats) || stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, color = 'text-slate-900', sub }) => (
        <div key={label} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold tracking-tight ${color}`}>{value}</span>
            {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
