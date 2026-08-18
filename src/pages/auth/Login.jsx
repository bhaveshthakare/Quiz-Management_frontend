import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../../store/auth'
import { errorMessage } from '../../api/client'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'ADMIN' ? '/admin' : location.state?.from || '/student')
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">Quiz<span className="text-primary-600">Platform</span></span>
        </Link>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to continue to the platform</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="font-semibold text-primary-600 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}