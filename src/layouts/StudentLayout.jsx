import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../store/theme'
import { useEffect } from 'react'

export default function StudentLayout() {
  const init = useTheme((s) => s.init)
  useEffect(() => init(), [init])
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Quiz Platform — Test your knowledge, track your progress.
      </footer>
    </div>
  )
}