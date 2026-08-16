import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, History as HistoryIcon } from 'lucide-react'
import client from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'

const statusTone = { PASSED: 'green', FAILED: 'red' }

export default function History() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/api/attempts').then((r) => setAttempts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold text-slate-900 dark:text-white">Attempt history</h1>
      <p className="mb-6 text-slate-500 dark:text-slate-400">Click any attempt to see its detailed result and answer review.</p>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-12 w-12" />}
          title="No attempts yet"
          subtitle="Take your first quiz to see your results here."
          action={<Link to="/student/quizzes" className="btn-primary">Browse quizzes</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Quiz</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Correct</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const mm = Math.floor(a.timeTaken / 60)
                const ss = a.timeTaken % 60
                return (
                  <tr key={a.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <Link to={`/student/result/${a.id}`} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                        {a.quizTitle}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.category}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(a.completedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{a.percentage}%</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {a.correctAnswers}/{a.correctAnswers + a.incorrectAnswers + a.unanswered}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {mm}:{String(ss).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-5 py-4"><Badge tone={statusTone[a.status]}>{a.status}</Badge></td>
                    <td className="px-5 py-4">
                      <Link to={`/student/result/${a.id}`} className="btn-secondary px-3 py-1.5 text-xs">View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}