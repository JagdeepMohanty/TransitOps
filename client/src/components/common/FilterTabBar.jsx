import { cn } from '@/utils'

/**
 * FilterTabBar — reusable horizontal tab strip with item counts.
 * Styled as an enterprise data filter control with clean count badges.
 */
export default function FilterTabBar({ tabs = [], active, onChange, getCount }) {
  const safeTabs = Array.isArray(tabs) ? tabs : []

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
      {safeTabs.map((tab) => {
        const { key, label, count } = tab
        const isActive = active === key

        let displayCount = null
        if (count !== undefined && count !== null) {
          displayCount = count
        } else if (typeof getCount === 'function') {
          try {
            displayCount = getCount(key)
          } catch {
            displayCount = null
          }
        }

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150',
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900',
            )}
          >
            <span>{label}</span>
            {displayCount !== null && displayCount !== undefined && (
              <span className={cn(
                'px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold',
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}>
                {displayCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
