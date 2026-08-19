import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import client from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'

const medalTone = [
  'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
]

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [categories, setCategories] = useState([])
  const [period, setPeriod] = useState('overall')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/api/categories').then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    let url = '/api/leaderboard'
    if (categoryId) {
      url = `/api/leaderboard/category/${categoryId}`
    } else if (period !== 'overall') {
      url = `/api/leaderboard/period?period=${period}`
    }
    client.get(url).then((r) => setEntries(r.data)).catch(() => setEntries([])).finally(() => setLoading(false))
  }, [categoryId, period])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-white">
            <Trophy className="h-7 w-7 text-accent-500" /> Leaderboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Top performers ranked by average score.</p>
        </div>
        <div className="flex gap-3">
          <select className="input md:w-44" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPeriod('overall') }}>
            <option value="">Overall</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!categoryId && (
            <select className="input md:w-40" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="overall">All time</option>
              <option value="weekly">This week</option>
              <option value="monthly">This month</option>
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <EmptyState icon={<Trophy className="h-12 w-12" />} title="No rankings yet" subtitle="Complete quizzes to appear on the leaderboard." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Average score</th>
                <th className="px-5 py-3">Highest score</th>
                <th className="px-5 py-3">Quizzes completed</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.userId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-bold ${e.rank <= 3 ? medalTone[e.rank - 1] : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {e.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                        {e.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{e.averageScore}%</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{e.highestScore}%</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{e.quizzesCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}