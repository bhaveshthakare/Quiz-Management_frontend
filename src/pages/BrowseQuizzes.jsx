import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import client from '../api/client'
import QuizCard from '../components/QuizCard'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

export default function BrowseQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: '', categoryId: '', difficulty: '', duration: '', sort: 'recent' })

  useEffect(() => {
    client.get('/api/categories').then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.categoryId) params.set('categoryId', filters.categoryId)
    if (filters.difficulty) params.set('difficulty', filters.difficulty)
    if (filters.duration) params.set('duration', filters.duration)
    if (filters.sort) params.set('sort', filters.sort)
    client.get(`/api/quizzes?${params}`)
      .then((r) => setQuizzes(r.data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Browse quizzes</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Search, filter and find the right challenge.</p>

        <div className="card mt-6 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search by quiz title or category..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <select className="input" value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="input" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
                <option value="">All difficulties</option>
                <option value="EASY">Easy</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="HARD">Hard</option>
              </select>
              <select className="input" value={filters.duration} onChange={(e) => setFilters({ ...filters, duration: e.target.value })}>
                <option value="">Any duration</option>
                <option value="short">Short (≤15 min)</option>
                <option value="medium">Medium (16-30 min)</option>
                <option value="long">Long (30+ min)</option>
              </select>
              <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                <option value="recent">Recently added</option>
                <option value="popular">Most popular</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : quizzes.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<SlidersHorizontal className="h-12 w-12" />}
              title="No quizzes found"
              subtitle="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Ready to attempt a quiz? <Link to="/auth/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link> or{' '}
          <Link to="/auth/register" className="font-semibold text-primary-600 hover:underline">create an account</Link>.
        </p>
      </main>
    </div>
  )
}