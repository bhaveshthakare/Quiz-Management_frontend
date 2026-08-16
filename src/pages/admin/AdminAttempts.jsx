import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search } from 'lucide-react'
import client from '../../api/client'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'

const statusTone = { PASSED: 'green', FAILED: 'red' }

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    client.get('/api/admin/attempts').then((r) => setAttempts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = attempts.filter((a) =>
    a.quizTitle.toLowerCase().includes(q.toLowerCase()) ||
    (a.studentName || '').toLowerCase().includes(q.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Attempts & results</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Monitor every quiz attempt across all students.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by quiz or student..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="No attempts yet" subtitle="Attempts will appear here as students complete quizzes." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Quiz</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Correct</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                        {(a.studentName || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{a.studentName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-700 dark:text-slate-200">{a.quizTitle}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.category}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {new Date(a.completedAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{a.percentage}%</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{a.correctAnswers}</td>
                  <td className="px-5 py-4"><Badge tone={statusTone[a.status]}>{a.status}</Badge></td>
                  <td className="px-5 py-4">
                    <Link to={`/admin/attempts/${a.id}`} className="btn-secondary px-3 py-1.5 text-xs">View result</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}