import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Bus, LogIn, ShieldCheck, CheckCircle2, ArrowRight, UserPlus, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { loginSchema } from '@/schemas/auth.schema'
import Button from '@/components/common/Button'

const DEMO_USERS = [
  { role: 'Fleet Manager',     email: 'fleet@transitops.com',      password: 'Fleet@123',      badge: 'Full Access' },
  { role: 'Dispatcher',        email: 'dispatcher@transitops.com', password: 'Dispatcher@123', badge: 'Trips & Fleet' },
  { role: 'Safety Officer',    email: 'safety@transitops.com',     password: 'Safety@123',     badge: 'Compliance' },
  { role: 'Financial Analyst', email: 'finance@transitops.com',    password: 'Finance@123',    badge: 'Reports & Costs' },
]

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, isLoading, navigate, from])

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Invalid email or password. Please try again.' })
    }
  }

  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left Column: Brand & Value Proposition */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-white shadow-2xl backdrop-blur-md">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TransitOps Enterprise v2.4
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Bus size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">TransitOps</h1>
                  <p className="text-xs text-slate-400 font-medium">Fleet Operations & Intelligence</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mt-4">
                Mission-critical lifecycle management for commercial transit. Monitor live trips, streamline vehicle maintenance schedules, and control operational expenses.
              </p>

              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>End-to-end trip dispatching with live odometer sync</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Proactive maintenance alerts & vehicle health logs</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Granular role-based security & audit traceability</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Commercial Fleet Standard</span>
              <span className="flex items-center gap-1 font-mono text-slate-400"><ShieldCheck size={14} className="text-brand-400" /> ISO 27001</span>
            </div>
          </div>

          {/* Right Column: Sign-in & Fast Demo Switcher */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to workspace</h2>
                <p className="text-xs text-slate-500 mt-1">Enter your operational credentials to access your console</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {errors.root && (
                  <div
                    className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                      errors.root.message?.includes('awaiting')
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : errors.root.message?.includes('rejected')
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {errors.root.message?.includes('awaiting') ? (
                      <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {errors.root.message?.includes('awaiting')
                          ? 'Approval Pending'
                          : errors.root.message?.includes('rejected')
                          ? 'Registration Rejected'
                          : 'Sign In Failed'}
                      </p>
                      <p className="mt-0.5">{errors.root.message}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                      ${errors.email
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                      }`}
                    placeholder="fleet@transitops.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                      ${errors.password
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                      }`}
                    placeholder="••••••••••••"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  fullWidth
                  size="lg"
                  leftIcon={<LogIn size={16} />}
                  className="mt-2"
                >
                  Sign In
                </Button>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Need an account?</span>
                  <Link
                    to="/register"
                    className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                  >
                    <UserPlus size={14} />
                    Register for Access
                  </Link>
                </div>
              </form>
            </div>

            {/* Quick Demo Pre-fill Card */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Role Access</span>
                <span className="text-[10px] text-brand-400 font-medium">Click to fill credentials</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map(({ role, email, password }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => fillDemo(email, password)}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-brand-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{role}</span>
                      <ArrowRight size={12} className="text-slate-500 group-hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">{email}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
