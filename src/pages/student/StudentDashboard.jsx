import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, BookOpen, Clock, Target, TrendingUp, Trophy, XCircle } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import client from '../../api/client'
import { useAuth } from '../../store/auth'
import Spinner from '../../components/Spinner'
import Badge from '../../components/Badge'

const statusTone = { PASSED: 'green', FAILED: 'red' }

export default function StudentDashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/api/attempts').then((r) => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const passed = history.filter((a) => a.status === 'PASSED').length
  const failed = history.filter((a) => a.status === 'FAILED').length
  const avg = history.length ? Math.round(history.reduce((s, a) => s + Number(a.percentage), 0) / history.length) : 0
  const best = history.length ? Math.max(...history.map((a) => Number(a.percentage))) : 0
  const answered = history.reduce((s, a) => s + a.correctAnswers + a.incorrectAnswers, 0)
  const chartData = [...history].reverse().slice(-14).map((a) => ({
    name: new Date(a.completedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    score: Number(a.percentage),
  }))

  const stats = [
    { icon: BookOpen, label: 'Quizzes attempted', value: history.length, tone: 'text-primary-600 bg-primary-50 dark:bg-primary-900/40 dark:text-primary-300' },
    { icon: Trophy, label: 'Passed', value: passed, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300' },
    { icon: XCircle, label: 'Failed', value: failed, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-900/40 dark:text-rose-300' },
    { icon: Target, label: 'Average score', value: `${avg}%`, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-900/40 dark:text-violet-300' },
    { icon: TrendingUp, label: 'Highest score', value: `${best}%`, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300' },
    { icon: BarChart3, label: 'Questions answered', value: answered, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-900/40 dark:text-sky-300' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hi, {user.name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Here&apos;s your quiz activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" /> Score trend
          </h2>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No attempts yet. <Link to="/student/quizzes" className="text-primary-600 hover:underline">Take your first quiz!</Link>
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'white' }} />
                <Line type="monotone" dataKey="score" name="Score %" stroke="#3c6cf0" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Trophy className="h-4 w-4 text-primary-600 dark:text-primary-400" /> Recent attempts
            </h2>
            <Link to="/student/history" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          {history.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No attempts yet.</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((a) => (
                <Link key={a.id} to={`/student/result/${a.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 transition hover:border-primary-300 dark:border-slate-800 dark:hover:border-primary-500">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{a.quizTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {a.category} · {new Date(a.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{a.percentage}%</span>
                    <Badge tone={statusTone[a.status]}>{a.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}