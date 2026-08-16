import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import client from '../../api/client'
import QuizCard from '../../components/QuizCard'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'

export default function StudentQuizList() {
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: '', categoryId: '', difficulty: '', duration: '' })

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
    client.get(`/api/quizzes?${params}`)
      .then((r) => setQuizzes(r.data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Available quizzes</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Pick a quiz and test yourself.</p>
        </div>
      </div>

      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search quizzes..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <select className="input md:w-48" value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input md:w-44" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
            <option value="">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="HARD">Hard</option>
          </select>
          <select className="input md:w-44" value={filters.duration} onChange={(e) => setFilters({ ...filters, duration: e.target.value })}>
            <option value="">Any duration</option>
            <option value="short">Short (≤15 min)</option>
            <option value="medium">Medium (16-30 min)</option>
            <option value="long">Long (30+ min)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title="No quizzes found"
          subtitle="No published quizzes match your filters right now. Check back soon!"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
        </div>
      )}
    </div>
  )
}