import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MailCheck } from 'lucide-react'
import client, { errorMessage } from '../../api/client'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [sent, setSent] = useState(false)

  const onSubmit = async (data) => {
    try {
      await client.post('/api/auth/forgot-password', { email: data.email })
      setSent(true)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            If an account exists for that email, we&apos;ve sent a password reset link. It expires in 60 minutes.
          </p>
          <Link to="/auth/login" className="btn-primary mt-6">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot password?</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered it? <Link to="/auth/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}