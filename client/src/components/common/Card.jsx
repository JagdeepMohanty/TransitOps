import { cn } from '@/utils'

const VARIANTS = {
  default:  'bg-white border border-slate-200/90 shadow-xs',
  flat:     'bg-white border border-slate-200/90',
  bordered: 'bg-white border-2 border-slate-200',
  elevated: 'bg-white border border-slate-200/90 shadow-card',
  ghost:    'bg-slate-50 border border-slate-200/60',
  gradient: 'bg-slate-900 border border-slate-800 text-white',
}

const PADDING = {
  none: '',
  xs:   'p-3',
  sm:   'p-3.5',
  md:   'p-5',
  lg:   'p-6',
  xl:   'p-8',
}

export default function Card({
  children,
  variant   = 'default',
  padding   = 'md',
  header,
  footer,
  hoverable = false,
  onClick,
  className,
  ...props
}) {
  const clickable = !!onClick || hoverable

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl overflow-hidden',
        VARIANTS[variant],
        clickable && [
          'cursor-pointer',
          'transition-all duration-150',
          'hover:border-slate-300 hover:shadow-card',
          'active:bg-slate-50/50',
        ],
        className,
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-slate-100 bg-slate-50/50">
          {header}
        </div>
      )}
      {padding === 'none' ? children : <div className={PADDING[padding]}>{children}</div>}
      {footer && (
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
          {footer}
        </div>
      )}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-3.5', className)}>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
