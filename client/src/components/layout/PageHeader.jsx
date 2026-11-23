import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils'

export default function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  back = false,
  backPath,
  divider = true,
  className,
}) {
  const navigate = useNavigate()
  const handleBack = () => backPath ? navigate(backPath) : navigate(-1)

  return (
    <div className={cn(
      'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
      divider && 'pb-4 border-b border-slate-200/80',
      className,
    )}>
      {/* Left: back + title */}
      <div className="flex items-start gap-3 min-w-0">
        {back && (
          <button
            onClick={handleBack}
            className="mt-0.5 p-1.5 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
            {badge && <span>{badge}</span>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap sm:shrink-0 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  )
}
