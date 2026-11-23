import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils'

const ROUTE_LABELS = {
  dashboard:   'Dashboard',
  vehicles:    'Vehicles',
  drivers:     'Drivers',
  trips:       'Trips',
  maintenance: 'Maintenance',
  finance:     'Finance',
  fuel:        'Fuel Logs',
  expenses:    'Expenses',
  reports:     'Reports',
  profile:     'Profile',
  add:         'Add',
  create:      'Create',
  edit:        'Edit',
}

export default function Breadcrumb({
  items: customItems,
  separator = 'chevron',
  className,
}) {
  const { pathname } = useLocation()

  const autoItems = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, i, arr) => ({
      label: ROUTE_LABELS[segment] ?? (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')),
      path:  '/' + arr.slice(0, i + 1).join('/'),
    }))

  const rawItems = customItems ?? autoItems

  if (rawItems.length === 0) return null

  return (
    <nav className={cn('flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3', className)} aria-label="Breadcrumb">
      <Link to="/" className="flex items-center gap-1 hover:text-brand-600 transition-colors duration-150">
        <Home size={13} />
        <span>TransitOps</span>
      </Link>

      {rawItems.map((item, i) => {
        const isLast = i === rawItems.length - 1
        return (
          <span key={item.path || i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-slate-700">{item.label}</span>
            ) : item.path ? (
              <Link to={item.path} className="hover:text-brand-600 transition-colors duration-150">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
