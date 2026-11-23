import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

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
};

function Breadcrumb({ overrides = {} }) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium" aria-label="Breadcrumb">
      <Link to="/" className="flex items-center gap-1 hover:text-brand-600 transition-colors duration-150">
        <Home className="w-3.5 h-3.5" />
        <span>TransitOps</span>
      </Link>
      {segments.map((seg, i) => {
        const label  = overrides[seg] ?? ROUTE_LABELS[seg] ?? (seg.charAt(0).toUpperCase() + seg.slice(1));
        const path   = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-slate-700">{label}</span>
            ) : (
              <Link to={path} className="hover:text-brand-600 transition-colors duration-150">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function PageShell({
  title,
  subtitle,
  actions,
  badge,
  breadcrumbs = true,
  breadcrumbOverrides,
  children,
}) {
  return (
    <div className="page-container space-y-5">
      {/* Page Header */}
      <div className="space-y-2 pb-1 border-b border-slate-200/80">
        {breadcrumbs && (
          <div className="mb-1">
            <Breadcrumb overrides={breadcrumbOverrides} />
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
