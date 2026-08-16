import { Link, NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../store/auth'
import { useTheme } from '../store/theme'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/student') : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">Quiz<span className="text-primary-600">Platform</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {!isAuthenticated && (
            <>
              <Link to="/" className={linkClass({ isActive: false })}>Home</Link>
              <Link to="/quizzes" className={linkClass({ isActive: false })}>Browse Quizzes</Link>
            </>
          )}
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/student" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/student/quizzes" className={linkClass}>Quizzes</NavLink>
              <NavLink to="/student/history" className={linkClass}>History</NavLink>
              <NavLink to="/student/leaderboard" className={linkClass}>Leaderboard</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={isAdmin ? '/admin' : '/student'}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/30"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/auth/login" className="btn-secondary">Login</Link>
              <Link to="/auth/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}