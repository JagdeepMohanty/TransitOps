import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils'
import EmptyState from './EmptyState'

export default function Table({
  columns = [],
  data = [],
  loading = false,
  skeletonRows = 5,
  selectable = false,
  selected = [],
  onSelect,
  onRowClick,
  emptyTitle,
  emptyDesc,
  emptyAction,
  className,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const safeData = Array.isArray(data) ? data : []
  const safeColumns = Array.isArray(columns) ? columns : []

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedData = [...safeData].sort((a, b) => {
    if (!sortKey || !a || !b) return 0
    const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const allSelected  = safeData.length > 0 && selected.length === safeData.length
  const someSelected = selected.length > 0 && !allSelected
  const toggleAll    = () => onSelect?.(allSelected ? [] : safeData.map(r => r?.id).filter(Boolean))
  const toggleRow    = (id) => onSelect?.(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-slate-300 group-hover:text-slate-400" />
    return sortDir === 'asc'
      ? <ChevronUp   size={12} className="text-brand-600" />
      : <ChevronDown size={12} className="text-brand-600" />
  }

  const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }

  // Visible columns for mobile
  const dataColumns = safeColumns.filter(c => c && c.label)

  if (!loading && sortedData.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDesc} action={emptyAction} />
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs', className)}>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {selectable && (
                <th className="th w-10 pr-0">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
              )}
              {safeColumns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'th group',
                    ALIGN[col.align ?? 'left'],
                    col.sortable && 'cursor-pointer select-none hover:bg-slate-100/90 transition-colors'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {selectable && <td className="td"><div className="w-4 h-4 bg-slate-100 rounded animate-pulse" /></td>}
                    {safeColumns.map(col => (
                      <td key={col.key} className="td">
                        <div className={cn('h-3.5 bg-slate-100 rounded animate-pulse', col.align === 'right' ? 'ml-auto' : '')}
                             style={{ width: `${Math.random() * 35 + 45}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : sortedData.map(row => (
                  <tr
                    key={row?.id ?? Math.random()}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer',
                      row?.id && selected.includes(row.id) ? 'bg-brand-50/70' : 'hover:bg-slate-50/70',
                    )}
                  >
                    {selectable && (
                      <td className="td pr-0" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={row?.id && selected.includes(row.id)}
                          onChange={() => row?.id && toggleRow(row.id)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {safeColumns.map(col => (
                      <td key={col.key} className={cn('td', ALIGN[col.align ?? 'left'])}>
                        {col.render ? col.render(row?.[col.key], row) : (row?.[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-slate-100">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          : sortedData.map(row => (
              <div
                key={row?.id ?? Math.random()}
                onClick={() => onRowClick?.(row)}
                className="p-4 space-y-2 hover:bg-slate-50 transition-colors"
              >
                {dataColumns.slice(0, 3).map(col => (
                  <div key={col.key} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{col.label}</span>
                    <span className="text-slate-800 font-semibold">
                      {col.render ? col.render(row?.[col.key], row) : (row?.[col.key] ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            ))
        }
      </div>
    </div>
  )
}
