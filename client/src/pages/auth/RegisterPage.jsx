import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Bus, UserPlus, ShieldCheck, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from 'lucide-react'
import { registerSchema, REQUESTED_ROLES } from '@/schemas/auth.schema'
import * as authApi from '@/api/auth.api'
import Button from '@/components/common/Button'

export default function RegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [registeredData, setRegisteredData] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      requestedRole: 'Dispatcher',
    },
  })

  const passwordVal = watch('password', '')

  const onSubmit = async (formData) => {
    try {
      const res = await authApi.register(formData)
      setRegisteredData({
        name: formData.name,
        email: formData.email,
        requestedRole: formData.requestedRole,
      })
      setIsSuccess(true)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration could not be completed. Please try again.'
      setError('root', { message })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left Column: Brand & Security Information */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-white shadow-2xl backdrop-blur-md">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Regulated Access Portal
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
                Join your operations organization on TransitOps. All new accounts go through administrator verification to ensure enterprise security and fleet governance.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mandatory Approval:</strong> Newly created accounts start in <code className="text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded">PENDING</code> status.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <ShieldCheck size={16} className="text-brand-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Role Verification:</strong> Your requested role will be reviewed and assigned by an authorized Fleet Manager.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Secure Credentials:</strong> Passwords are encrypted with industrial salted bcrypt algorithms.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>RBAC Commercial Standard</span>
              <span className="flex items-center gap-1 font-mono text-slate-400">
                <ShieldCheck size={14} className="text-brand-400" /> ISO 27001
              </span>
            </div>
          </div>

          {/* Right Column: Registration Form or Success Screen */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl">
              {isSuccess ? (
                <div className="text-center py-4 space-y-5">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border-4 border-amber-100 shadow-sm">
                    <Clock size={32} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Registration Request Received!
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                      Thank you, <strong>{registeredData?.name}</strong>. Your account has been registered with{' '}
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        PENDING APPROVAL
                      </span>{' '}
                      status.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Registered Email:</span>
                      <span className="font-mono font-medium text-slate-900">{registeredData?.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Requested Role:</span>
                      <span className="font-medium text-slate-900">{registeredData?.requestedRole}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Current Access State:</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Clock size={13} /> Awaiting Administrator Approval
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-left text-xs text-blue-800">
                    <p className="font-semibold mb-0.5">What happens next?</p>
                    <p className="text-blue-700">
                      An authorized Fleet Manager will review your registration request, verify your operational need, and activate your account. You will be able to log in once approved.
                    </p>
                  </div>

                  <Link to="/login" className="block pt-2">
                    <Button fullWidth size="lg" leftIcon={<ArrowLeft size={16} />}>
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Request Workspace Account
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Submit your credentials and operational role request for administrator review
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {errors.root && (
                      <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.root.message}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        {...register('name')}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                          ${errors.name
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                          }`}
                        placeholder="e.g. Vikram Sharma"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                    </div>

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
                        placeholder="yourname@transitops.com"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="requestedRole" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Requested Operational Role
                      </label>
                      <select
                        id="requestedRole"
                        {...register('requestedRole')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      >
                        {REQUESTED_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Requested role will be confirmed or adjusted by the approving administrator.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          {...register('password')}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                            ${errors.password
                              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                              : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                            }`}
                          placeholder="Min. 8 chars"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          {...register('confirmPassword')}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                            ${errors.confirmPassword
                              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                              : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                            }`}
                          placeholder="Re-enter password"
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    {passwordVal && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600">
                        <span className="font-semibold block mb-1">Security requirements:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                          <li className={passwordVal.length >= 8 ? 'text-emerald-600 font-medium' : ''}>
                            At least 8 characters
                          </li>
                          <li className={/[A-Za-z]/.test(passwordVal) ? 'text-emerald-600 font-medium' : ''}>
                            Contains at least one letter
                          </li>
                          <li className={/[0-9]/.test(passwordVal) ? 'text-emerald-600 font-medium' : ''}>
                            Contains at least one number
                          </li>
                        </ul>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      fullWidth
                      size="lg"
                      leftIcon={<UserPlus size={16} />}
                      className="mt-2"
                    >
                      Submit Registration Request
                    </Button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-600">
                      Already have an approved account?{' '}
                      <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 underline">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
