import { useState, useEffect } from 'react'
import { Receipt } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils'
import { expensesApi } from '@/api/expenses.api'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ExpenseChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    expensesApi.list({ limit: 100 })
      .then(res => {
        if (cancelled) return
        const expenses = res.data?.data?.data ?? res.data?.data ?? []
        if (!Array.isArray(expenses) || expenses.length === 0) {
          setData([])
          return
        }

        const monthlyMap = {}
        for (const exp of expenses) {
          const d = exp.expenseDate ? new Date(exp.expenseDate) : new Date(exp.createdAt)
          if (isNaN(d.getTime())) continue
          const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
          const label = MONTH_NAMES[d.getMonth()]
          if (!monthlyMap[key]) {
            monthlyMap[key] = { month: label, sortKey: key, amount: 0 }
          }
          monthlyMap[key].amount += Number(exp.amount || 0)
        }

        const sorted = Object.values(monthlyMap)
          .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
          .map(({ month, amount }) => ({ month, amount: Math.round(amount) }))

        setData(sorted)
      })
      .catch(() => {
        if (!cancelled) setData([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
          <Receipt size={15} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Monthly Operating Expenses</h3>
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm animate-pulse">
          Loading expense analytics…
        </div>
      ) : data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
          No operating expense records found.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              formatter={(v) => [formatCurrency(v), 'Expenses']}
            />
            <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
