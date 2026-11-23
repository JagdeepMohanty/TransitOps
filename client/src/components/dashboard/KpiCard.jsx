import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils'

export default function KpiCard({ title, subtitle, value, change, changeLabel, icon: Icon, iconColor = 'text-brand-600', iconBg = 'bg-brand-50', primary = false }) {
  const isPositive = change >= 0
  return (
    <div className={cn(
      'rounded-2xl border p-5 transition-all duration-150',
      primary
        ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-slate-800 text-white shadow-md'
        : 'bg-white border-slate-200/80 shadow-xs hover:shadow-card hover:border-slate-300'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-[11px] font-bold uppercase tracking-wider',
            primary ? 'text-slate-400' : 'text-slate-500'
          )}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className={cn(
              'text-2xl font-bold tracking-tight',
              primary ? 'text-white' : 'text-slate-900'
            )}>
              {value}
            </span>
            {subtitle && (
              <span className={cn('text-xs font-medium', primary ? 'text-slate-400' : 'text-slate-400')}>
                {subtitle}
              </span>
            )}
          </div>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-semibold',
              isPositive ? 'text-emerald-500' : 'text-rose-500'
            )}>
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{Math.abs(change)}% {changeLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            primary ? 'bg-slate-800 border border-slate-700/80' : cn(iconBg, 'border border-slate-100')
          )}>
            <Icon size={18} className={primary ? 'text-brand-400' : iconColor} />
          </div>
        )}
      </div>
    </div>
  )
}
